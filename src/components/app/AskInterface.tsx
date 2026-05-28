'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, FileText, MessageSquare, Sparkles, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RAGResponse } from '@/types'

interface Message {
  role: 'user' | 'ai'
  text: string
  response?: RAGResponse
}

const SUGGESTIONS = [
  { text: 'What are our top project risks this quarter?', category: 'Risk' },
  { text: "Summarise the latest board report", category: 'Summary' },
  { text: 'Which contracts are expiring in the next 90 days?', category: 'Legal' },
  { text: 'What is the current status of our flagship project?', category: 'Projects' },
]

interface Props {
  userName?: string
}

export default function AskInterface({ userName = 'there' }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function submit(query: string) {
    const q = query.trim()
    if (!q || loading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data: RAGResponse = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.answer, response: data }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">

      {/* ── Messages / Welcome ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (

          /* Welcome state */
          <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-xl shadow-brand/25 mb-6">
                <Sparkles className="h-7 w-7 text-white" />
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900">
                {greeting}, {userName}
              </h2>
              <p className="mt-2 text-gray-500 text-base">
                What would you like to know about your Devtraco documents?
              </p>

              {/* Suggestion cards */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map(s => (
                  <button key={s.text} onClick={() => submit(s.text)}
                    className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-brand/30 hover:shadow-md hover:shadow-brand/8">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light transition group-hover:bg-brand">
                      <MessageSquare className="h-4 w-4 text-brand transition group-hover:text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand/70">{s.category}</span>
                      <p className="mt-0.5 text-sm leading-snug text-gray-700">{s.text}</p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Press{' '}
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-sm">
                  Enter
                </kbd>{' '}
                to send ·{' '}
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-sm">
                  Shift + Enter
                </kbd>{' '}
                for a new line
              </p>
            </div>
          </div>

        ) : (

          /* Chat messages */
          <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-4', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  msg.role === 'user' ? 'bg-brand text-white shadow-md shadow-brand/30' : 'bg-gray-200 text-gray-600'
                )}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>

                <div className="max-w-xl space-y-3">
                  <div className={cn(
                    'rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-line',
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-brand text-white'
                      : 'rounded-tl-sm border border-gray-200 bg-white text-gray-800 shadow-sm'
                  )}>
                    {msg.text}
                  </div>

                  {/* Citations */}
                  {msg.response?.citations && msg.response.citations.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-400">
                        <BookOpen className="h-3 w-3" /> Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.response.citations.map((c, ci) => (
                          <span key={ci}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand-light px-2.5 py-1 text-xs font-medium text-brand">
                            <FileText className="h-3 w-3" />{c.document_title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {msg.response?.risks && msg.response.risks.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" /> Risks identified
                      </p>
                      <ul className="space-y-1">
                        {msg.response.risks.map((r, ri) => (
                          <li key={ri} className="text-xs text-amber-700">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {msg.response?.recommendations && msg.response.recommendations.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Recommendations
                      </p>
                      <ul className="space-y-1">
                        {msg.response.recommendations.map((r, ri) => (
                          <li key={ri} className="text-xs text-emerald-700">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-5 py-4 text-sm text-gray-400 shadow-sm">
                  Searching your documents…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-4">
        <form
          onSubmit={e => { e.preventDefault(); submit(input) }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e.target) }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input) } }}
              placeholder="Ask anything about your documents…"
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-30">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
