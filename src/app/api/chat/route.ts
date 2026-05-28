import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { query } = await request.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  // Look up tenant
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role, tenants(id, name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 403 })
  }

  const tenantId = membership.tenant_id

  try {
    // 1. Embed the query using OpenAI
    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    })
    const embeddingData = await embeddingRes.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // 2. Retrieve relevant chunks (permission-aware via RLS)
    const { data: chunks } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      p_tenant_id: tenantId,
      match_threshold: 0.7,
      match_count: 8,
    })

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information in your documents to answer that question. Try uploading more documents or rephrasing your query.",
        citations: [],
        confidence_score: 0,
        risks: [],
        recommendations: [],
      })
    }

    // 3. Build context from retrieved chunks
    const context = chunks
      .map((c: { chunk_text: string }, i: number) => `[${i + 1}] ${c.chunk_text}`)
      .join('\n\n')

    // 4. Generate answer with GPT-4o
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an enterprise intelligence assistant. Answer the user's question using ONLY the provided document excerpts.
Always:
- Be concise and direct
- Cite source numbers like [1], [2] inline
- List any risks you identify
- Suggest 1-2 recommendations if relevant
- If the context doesn't have enough info, say so honestly

Respond in this JSON format:
{
  "answer": "your main answer with inline citations",
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["rec 1"],
  "confidence_score": 0.85
}`,
          },
          {
            role: 'user',
            content: `Document excerpts:\n${context}\n\nQuestion: ${query}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    })

    const chatData = await chatRes.json()
    const parsed = JSON.parse(chatData.choices[0].message.content)

    // 5. Save conversation to DB
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        tenant_id: tenantId,
        query,
        response: parsed.answer,
        confidence_score: parsed.confidence_score,
        risks: parsed.risks,
        recommendations: parsed.recommendations,
      })
      .select()
      .single()

    // 6. Save citations
    if (conversation && chunks.length > 0) {
      await supabase.from('citations').insert(
        chunks.map((c: { id: string; similarity: number }) => ({
          conversation_id: conversation.id,
          document_chunk_id: c.id,
          relevance_score: c.similarity,
        }))
      )
    }

    // 7. Fetch document titles for citation display
    const chunkIds = chunks.map((c: { id: string }) => c.id)
    const { data: chunkDetails } = await supabase
      .from('document_chunks')
      .select('id, documents(title)')
      .in('id', chunkIds)

    const citations = chunks.map((c: { id: string; chunk_text: string; similarity: number }) => {
      const detail = chunkDetails?.find((d) => d.id === c.id)
      const rawDocs = detail?.documents as unknown
      const docTitle = Array.isArray(rawDocs)
        ? (rawDocs[0] as { title: string })?.title
        : (rawDocs as { title: string } | null)?.title
      return {
        id: c.id,
        conversation_id: conversation?.id ?? '',
        document_chunk_id: c.id,
        document_title: docTitle ?? 'Unknown document',
        chunk_text: c.chunk_text,
        relevance_score: c.similarity,
      }
    })

    return NextResponse.json({
      answer: parsed.answer,
      citations,
      confidence_score: parsed.confidence_score,
      risks: parsed.risks ?? [],
      recommendations: parsed.recommendations ?? [],
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
