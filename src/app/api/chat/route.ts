import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const OPENAI_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
}

// Delimited text format — avoids JSON-mode latency overhead and lets us stream cleanly
const SYSTEM_PROMPT = `You are Devtraco Plus, a friendly and professional AI assistant for Devtraco, a leading Ghanaian real estate company. Help the team find clear, accurate answers from their project documents.

Personality: warm, polite, professional — like a knowledgeable colleague always happy to help.

Rules:
- Answer ONLY using the provided document excerpts — never invent facts
- Cite sources inline like [1], [2] so the user can verify
- Be concise but thorough
- If context is insufficient, say so kindly

Format your response EXACTLY like this (no other format):

[ANSWER]
Your detailed answer here with inline citations like [1]

[RISKS]
• risk 1 (write "None identified" if there are no risks)

[RECS]
• recommendation 1 (omit bullet if not applicable)`

function parseDelimited(text: string) {
  const answerMatch = text.match(/\[ANSWER\]([\s\S]*?)(?=\n\[RISKS\]|\n\[RECS\]|$)/)
  const risksMatch  = text.match(/\[RISKS\]([\s\S]*?)(?=\n\[RECS\]|$)/)
  const recsMatch   = text.match(/\[RECS\]([\s\S]*)$/)

  const parseList = (s: string | undefined) =>
    (s ?? '').split('\n')
      .map(l => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(l => l && l.toLowerCase() !== 'none identified' && l.toLowerCase() !== 'none')

  return {
    answer:          answerMatch?.[1]?.trim() ?? text.trim(),
    risks:           parseList(risksMatch?.[1]),
    recommendations: parseList(recsMatch?.[1]),
  }
}

function sseStream(chunks: (() => string)[], onDone?: () => void) {
  const enc = new TextEncoder()
  return new ReadableStream({
    start(c) {
      for (const chunk of chunks) c.enqueue(enc.encode(chunk()))
      onDone?.()
      c.close()
    },
  })
}

function sseHeaders() {
  return {
    'Content-Type':    'text/event-stream',
    'Cache-Control':   'no-cache',
    'X-Accel-Buffering': 'no',
  }
}

/* ── GET: conversation history ───────────────────────────── */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('conversations')
    .select('id, query, response, risks, recommendations, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  return NextResponse.json({ conversations: data ?? [] })
}

/* ── POST: streaming chat ────────────────────────────────── */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { query } = await request.json()
  if (!query?.trim()) return new Response('Query required', { status: 400 })

  const enc = new TextEncoder()

  /* ── Greetings shortcut (no RAG needed) ────────────────── */
  const greetingRx = /^(hi+|hello+|hey+|good\s?(morning|afternoon|evening)|howdy|hiya|what'?s up|sup|greetings|yo)[!?.]*$/i
  if (greetingRx.test(query.trim())) {
    const firstName = (user.user_metadata?.name || user.email?.split('@')[0] || 'there').split(/\s+/)[0]
    const msg = `Hello ${firstName}! 😊 I'm Devtraco Plus, your document intelligence assistant. Ask me anything about your project files, contracts, or site reports. How can I help today?`
    return new Response(
      sseStream([
        () => `data: ${JSON.stringify({ t: msg })}\n\n`,
        () => `data: ${JSON.stringify({ done: true, answer: msg, risks: [], recommendations: [], citations: [], confidence_score: 1 })}\n\n`,
      ]),
      { headers: sseHeaders() }
    )
  }

  /* ── Membership (only tenant_id + role needed) ──────────── */
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return new Response('No workspace', { status: 403 })
  const tenantId = membership.tenant_id

  try {
    /* ── 1. Embed query ─────────────────────────────────────── */
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: OPENAI_HEADERS,
      body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
    })
    const embData = await embRes.json()
    const queryEmbedding = embData.data[0].embedding

    /* ── 2. Retrieve chunks ──────────────────────────────────── */
    const { data: chunks } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      p_tenant_id:     tenantId,
      match_threshold: 0.65,
      match_count:     5,   // down from 8 — fewer tokens = faster inference
    })

    /* ── No documents found ─────────────────────────────────── */
    if (!chunks?.length) {
      const msg = "I wasn't able to find any relevant documents to answer that. Your workspace may not have any files uploaded yet.\n\nHead over to the **Documents** section to upload your PDFs, contracts, or site reports — I'll be ready to answer right away! 📂"
      return new Response(
        sseStream([
          () => `data: ${JSON.stringify({ t: msg })}\n\n`,
          () => `data: ${JSON.stringify({ done: true, answer: msg, risks: [], recommendations: [], citations: [], confidence_score: 0 })}\n\n`,
        ]),
        { headers: sseHeaders() }
      )
    }

    const context = chunks
      .map((c: { chunk_text: string }, i: number) => `[${i + 1}] ${c.chunk_text}`)
      .join('\n\n')

    /* ── 3. Prefetch citation titles while OpenAI responds ───── */
    const chunkDetailsPromise = supabase
      .from('document_chunks')
      .select('id, documents(title)')
      .in('id', chunks.map((c: { id: string }) => c.id))

    /* ── 4. Stream from gpt-4o-mini (10× faster than gpt-4o) ── */
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: OPENAI_HEADERS,
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        temperature: 0.2,
        max_tokens:  800,
        stream:      true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: `Document excerpts:\n${context}\n\nQuestion: ${query}` },
        ],
      }),
      signal: request.signal,
    })

    /* ── 5. Transform OpenAI SSE → client SSE ───────────────── */
    const stream = new ReadableStream({
      async start(controller) {
        const reader  = openaiRes.body!.getReader()
        const decoder = new TextDecoder()
        let fullText  = ''
        let buf       = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buf += decoder.decode(value, { stream: true })
            const lines = buf.split('\n')
            buf = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const raw = line.slice(6).trim()
              if (raw === '[DONE]') continue

              let parsed: { choices?: { delta?: { content?: string } }[] }
              try { parsed = JSON.parse(raw) } catch { continue }

              const token = parsed.choices?.[0]?.delta?.content ?? ''
              if (!token) continue

              fullText += token
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ t: token })}\n\n`))
            }
          }

          /* ── Parse structured response ───────────────────── */
          const { answer, risks, recommendations } = parseDelimited(fullText)

          /* ── Resolve citations (should already be ready) ───── */
          const { data: chunkDetails } = await chunkDetailsPromise
          const citations = chunks.map((c: { id: string; chunk_text: string; similarity: number }) => {
            const detail  = chunkDetails?.find(d => d.id === c.id)
            const rawDocs = detail?.documents as { title: string } | { title: string }[] | null
            const title   = Array.isArray(rawDocs) ? rawDocs[0]?.title : rawDocs?.title
            return {
              id: c.id, conversation_id: '',
              document_chunk_id: c.id,
              document_title: title ?? 'Document',
              chunk_text: c.chunk_text,
              relevance_score: c.similarity,
            }
          })

          /* ── Send done event with all structured data ───────── */
          controller.enqueue(enc.encode(
            `data: ${JSON.stringify({ done: true, answer, risks, recommendations, citations, confidence_score: 0.85 })}\n\n`
          ))

          /* ── Background DB save — does NOT block the response ─ */
          Promise.resolve().then(async () => {
            try {
              const { data: conv } = await supabase
                .from('conversations')
                .insert({ user_id: user.id, tenant_id: tenantId, query, response: answer, confidence_score: 0.85, risks, recommendations })
                .select('id').single()

              if (conv && chunks.length) {
                await supabase.from('citations').insert(
                  chunks.map((c: { id: string; similarity: number }) => ({
                    conversation_id: conv.id,
                    document_chunk_id: c.id,
                    relevance_score: c.similarity,
                  }))
                )
              }
            } catch (e) { console.error('Background save failed:', e) }
          })

        } catch (err) {
          if ((err as Error).name !== 'AbortError') console.error('Stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: sseHeaders() })

  } catch (err) {
    console.error('Chat API error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
