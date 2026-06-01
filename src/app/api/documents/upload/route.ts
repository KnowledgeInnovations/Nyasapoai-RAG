import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import path from 'path'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

// Office formats handled by officeparser (DOCX, XLSX, PPTX, ODT, ODS, ODP, etc.)
const OFFICE_EXTS = new Set([
  '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.odt', '.ods', '.odp',
])

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize))
    start += chunkSize - overlap
  }
  return chunks.filter(c => c.trim().length > 50)
}

async function embedText(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  const data = await res.json()
  return data.data[0].embedding
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase()

  // PDF
  if (ext === '.pdf') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('pdf-parse') as any
    const pdfParse = mod.default ?? mod
    const parsed = await pdfParse(buffer)
    return parsed.text as string
  }

  // Office formats (DOCX, XLSX, PPTX, ODT, ODS, ODP, DOC, XLS, PPT)
  if (OFFICE_EXTS.has(ext)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { parseOffice } = await import('officeparser') as any
    const fileType = ext.slice(1) // '.docx' → 'docx'
    return (await parseOffice(buffer, { fileType })) as string
  }

  // Plain text, CSV, JSON, XML, Markdown, and any other text-based format
  return buffer.toString('utf-8')
}

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
  if (!['senior', 'middle'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const formData   = await request.formData()
  const file        = formData.get('file') as File | null
  const department  = (formData.get('department')  as string) || null
  const sensitivity = (formData.get('sensitivity') as string) || 'internal'
  const customTitle = (formData.get('title')       as string) || ''

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload raw file to Supabase Storage (service role bypasses RLS)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const storagePath = `${membership.tenant_id}/${Date.now()}-${file.name}`
  const { error: storageError } = await serviceClient.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream' })

  if (storageError) {
    console.error('Storage error:', storageError)
    return NextResponse.json({ error: 'File storage failed' }, { status: 500 })
  }

  // Insert document record with status 'processing'
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      tenant_id:   membership.tenant_id,
      uploaded_by: user.id,
      title:       customTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
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
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
  }

  try {
    const text = await extractText(buffer, file.name)

    if (!text.trim()) {
      await supabase.from('documents').update({ status: 'failed' }).eq('id', document.id)
      return NextResponse.json(
        { error: 'No text could be extracted from this file. The document may be image-based or corrupted.' },
        { status: 422 }
      )
    }

    // Chunk and embed
    const chunks = chunkText(text)
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i])
      await supabase.from('document_chunks').insert({
        document_id: document.id,
        tenant_id:   membership.tenant_id,
        chunk_text:  chunks[i],
        chunk_index: i,
        embedding,
        metadata: { source: file.name, chunk_index: i, total_chunks: chunks.length },
      })
    }

    await supabase.from('documents').update({ status: 'ready' }).eq('id', document.id)
    return NextResponse.json({ document: { ...document, status: 'ready' } })
  } catch (err) {
    console.error('Processing error:', err)
    await supabase.from('documents').update({ status: 'failed' }).eq('id', document.id)
    return NextResponse.json({ error: 'Document processing failed', document }, { status: 500 })
  }
}
