'use client'

import { FileText, X } from 'lucide-react'
import type { Citation } from '@/types'

interface Props {
  citation: Citation | null
  onClose: () => void
}

export default function SourceViewer({ citation, onClose }: Props) {
  if (!citation) return null

  const score = Math.round((citation.relevance_score ?? 0) * 100)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel — slides in from the right on desktop, up from bottom on mobile */}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl
                      w-full md:w-[420px] md:h-full md:border-l md:border-gray-200
                      h-[70vh] rounded-t-3xl md:rounded-none
                      animate-in slide-in-from-bottom md:slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light">
              <FileText className="h-4.5 w-4.5 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-snug truncate pr-2">
                {citation.document_title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Source document</span>
                {score > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {score}% match
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Relevant excerpt
          </p>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {citation.chunk_text}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            This is the exact passage the AI used to answer your question.
          </p>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Back to chat
          </button>
        </div>
      </div>
    </>
  )
}
