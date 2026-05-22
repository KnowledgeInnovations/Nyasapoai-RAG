'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RAGResponse } from '@/types'

interface Message {
  role: 'user' | 'ai'
  text: string
  response?: RAGResponse
}

export default function AskInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const query = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: query }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data: RAGResponse = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: data.answer, response: data },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <p className="text-sm">Ask anything about your organisation's documents.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'What are our top risks this quarter?',
                'Summarise last month's board report',
                'Which contracts are expiring soon?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs hover:border-indigo-300 hover:text-indigo-600"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {msg.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="max-w-xl space-y-2">
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {msg.text}
              </div>

              {/* Citations */}
              {msg.response?.citations && msg.response.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.response.citations.map((c, ci) => (
                    <span
                      key={ci}
                      className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700"
                    >
                      {c.document_title}
                    </span>
                  ))}
                </div>
              )}

              {/* Risks & recommendations */}
              {msg.response?.risks && msg.response.risks.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Risks identified</p>
                  <ul className="space-y-1">
                    {msg.response.risks.map((r, ri) => (
                      <li key={ri} className="text-xs text-amber-700">• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
            <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
              Searching your documents…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 border-t border-gray-100 p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your documents…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
