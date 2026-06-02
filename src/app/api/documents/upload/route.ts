import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { extractText, chunkText, embedBatch, EMBED_BATCH } from '@/lib/documentProcess'

const MAX_SIZE = 500 * 1024 * 1024 // 500 MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'No workspace found' }, { status: 403 })
  if (!['admin', 'exco', 'senior_manager', 'senior', 'middle'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const formData   = await request.formData()
  const file        = formData.get('file') as File | null
  const department  = (formData.get('department')  as string) || null
  const sensitivity = (formData.get('sensitivity') as string) || 'internal'
  const customTitle = (formData.get('title')       as string) || ''

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 500 MB limit' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload raw file to Supabase Storage (service role bypasses RLS)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Ensure the bucket exists (no-op if it already does)
  await serviceClient.storage.createBucket('documents', { public: false }).catch(() => {})

  // Sanitise filename — replace spaces/special chars so the storage path is always valid
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const storagePath  = `${membership.tenant_id}/${Date.now()}-${safeFilename}`

  const { error: storageError } = await serviceClient.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream' })

  if (storageError) {
    console.error('Storage error:', storageError)
    return NextResponse.json({ error: `File storage failed: ${storageError.message}` }, { status: 500 })
  }

  // Insert document record with status 'processing'
  const docTitle = customTitle.trim() || file.name.replace(/\.[^.]+$/, '')
  const { data: document, error: docError } = await serviceClient
    .from('documents')
    .insert({
      tenant_id:   membership.tenant_id,
      uploaded_by: user.id,
      title:       docTitle,
      source:      file.name,
      department,
      sensitivity,
      status:      'processing',
      file_path:   storagePath,
      file_size:   file.size,
      mime_type:   file.type || 'application/octet-stream',
    })
    .select()
    .single()

  if (docError || !document) {
    console.error('Document insert error:', docError)
    return NextResponse.json({ error: `Failed to create document record: ${docError?.message}` }, { status: 500 })
  }

  try {
    // Step 1: extract text
    let text: string
    try {
      text = await extractText(buffer, file.name)
    } catch (extractErr) {
      console.error('Text extraction error:', extractErr)
      await serviceClient.from('documents').update({ status: 'failed' }).eq('id', document.id)
      return NextResponse.json(
        { error: `Text extraction failed: ${(extractErr as Error).message}` },
        { status: 500 }
      )
    }

    if (!text.trim()) {
      await serviceClient.from('documents').update({ status: 'failed' }).eq('id', document.id)
      return NextResponse.json(
        { error: 'No text could be extracted. The file may be image-based, password-protected, or corrupted.' },
        { status: 422 }
      )
    }

    // Step 2: paragraph-aware chunking + batch embedding
    // Prepend document title to every chunk so filename searches work via vector search
    const titleLabel = `[Document: ${docTitle}]\n`
    const rawChunks  = chunkText(text)
    const chunks     = rawChunks.map(c => titleLabel + c)

    for (let start = 0; start < chunks.length; start += EMBED_BATCH) {
      const batch = chunks.slice(start, start + EMBED_BATCH)
      let embeddings: number[][]
      try {
        embeddings = await embedBatch(batch)
      } catch (embedErr) {
        console.error('Embedding error at batch', start, embedErr)
        await serviceClient.from('documents').update({ status: 'failed' }).eq('id', document.id)
        return NextResponse.json(
          { error: `Embedding failed: ${(embedErr as Error).message}` },
          { status: 500 }
        )
      }
      await serviceClient.from('document_chunks').insert(
        batch.map((chunkText, j) => ({
          document_id: document.id,
          tenant_id:   membership.tenant_id,
          chunk_text:  chunkText,
          chunk_index: start + j,
          embedding:   embeddings[j],
          metadata: { source: file.name, chunk_index: start + j, total_chunks: chunks.length },
        }))
      )
    }

    await serviceClient.from('documents').update({ status: 'ready' }).eq('id', document.id)
    return NextResponse.json({ document: { ...document, status: 'ready' } })
  } catch (err) {
    console.error('Processing error:', err)
    await serviceClient.from('documents').update({ status: 'failed' }).eq('id', document.id)
    return NextResponse.json(
      { error: `Document processing failed: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
