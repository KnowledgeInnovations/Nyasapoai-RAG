'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle2, XCircle, Lock } from 'lucide-react'
import type { Document } from '@/types'
import { formatDate } from '@/lib/utils'
import { CATEGORIES, getCategoryByValue } from '@/lib/documentCategories'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const UploadModal = dynamic(() => import('./UploadModal'), { ssr: false })

interface Props {
  initialDocuments: Document[]
  canUpload: boolean
}

const statusConfig = {
  ready:      { icon: CheckCircle2, label: 'Ready',      cls: 'text-green-600 bg-green-50 border-green-200' },
  processing: { icon: Clock,        label: 'Processing', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  failed:     { icon: XCircle,      label: 'Failed',     cls: 'text-red-600   bg-red-50   border-red-200'   },
}

export default function DocumentsClient({ initialDocuments, canUpload }: Props) {
  const [documents,   setDocuments]   = useState<Document[]>(initialDocuments)
  const [filter,      setFilter]      = useState('all')
  const [showUpload,  setShowUpload]  = useState(false)
  const router = useRouter()

  // Category counts
  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.value] = documents.filter(d => d.department === cat.value).length
    return acc
  }, {})
  const uncategorised = documents.filter(d => !d.department || !CATEGORIES.find(c => c.value === d.department)).length
  const totalCount    = documents.length

  // Filtered list
  const filtered = filter === 'all'
    ? documents
    : filter === 'uncategorised'
    ? documents.filter(d => !d.department)
    : documents.filter(d => d.department === filter)

  function handleUploaded() {
    router.refresh()
    // Optimistically refresh — router.refresh() will re-fetch server data
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            {canUpload
              ? 'Upload and manage your project documents — all searchable by AI.'
              : 'Browse documents shared in your workspace.'}
          </p>
        </div>

        {canUpload ? (
          <button onClick={() => setShowUpload(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark">
            Upload documents
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400">
            <Lock className="h-4 w-4" /> View only
          </div>
        )}
      </div>

      {/* ── Category overview cards ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map(cat => (
          <button key={cat.value}
            onClick={() => setFilter(filter === cat.value ? 'all' : cat.value)}
            disabled={counts[cat.value] === 0}
            className={cn(
              'group flex flex-col items-start rounded-2xl border p-4 text-left transition hover:shadow-md disabled:cursor-default disabled:opacity-40',
              filter === cat.value
                ? `${cat.activeBorder} ${cat.activeBg} shadow-sm`
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}>
            <cat.icon className={cn(
              'mb-2 h-5 w-5 transition',
              filter === cat.value ? cat.textColor : 'text-gray-400 group-hover:text-gray-500',
            )} />
            <p className={cn('text-xl font-black leading-none', filter === cat.value ? cat.activeText : 'text-gray-900')}>
              {counts[cat.value]}
            </p>
            <p className={cn('mt-1 text-xs font-semibold leading-tight', filter === cat.value ? cat.activeText : 'text-gray-500')}>
              {cat.label}
            </p>
          </button>
        ))}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
            filter === 'all'
              ? 'border-brand bg-brand text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
          )}>
          All ({totalCount})
        </button>

        {CATEGORIES.filter(cat => counts[cat.value] > 0).map(cat => (
          <button key={cat.value} onClick={() => setFilter(cat.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
              filter === cat.value
                ? `${cat.activeBorder} ${cat.activeBg} ${cat.activeText} shadow-sm`
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
            )}>
            {cat.label} ({counts[cat.value]})
          </button>
        ))}

        {uncategorised > 0 && (
          <button onClick={() => setFilter('uncategorised')}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
              filter === 'uncategorised'
                ? 'border-gray-400 bg-gray-100 text-gray-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            )}>
            Uncategorised ({uncategorised})
          </button>
        )}
      </div>

      {/* ── Documents table / empty state ───────────────────── */}
      {documents.length === 0 ? (
        <div
          onClick={() => canUpload && setShowUpload(true)}
          className={cn(
            'rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center',
            canUpload && 'cursor-pointer hover:border-brand transition-colors'
          )}>
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-500">No documents yet</p>
          <p className="mt-1 text-xs text-gray-400">
            {canUpload
              ? 'Click here or use the Upload button to add your first document.'
              : 'Documents uploaded by your workspace admin will appear here.'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-400">
            No documents in this category yet.
          </p>
          {canUpload && (
            <button onClick={() => setShowUpload(true)}
              className="mt-4 rounded-xl border border-brand/30 bg-brand-light px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white">
              Upload to this category
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Document</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Category</th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold text-gray-500 sm:table-cell">Access</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Status</th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold text-gray-500 lg:table-cell">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(doc => {
                const s   = statusConfig[doc.status]
                const cat = getCategoryByValue(doc.department)
                return (
                  <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                          cat ? `${cat.bgColor} ${cat.borderColor}` : 'bg-gray-50 border-gray-200'
                        )}>
                          {cat
                            ? <cat.icon className={cn('h-4 w-4', cat.textColor)} />
                            : <FileText className="h-4 w-4 text-gray-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900 max-w-[200px]">{doc.title}</p>
                          <p className="truncate text-xs text-gray-400 max-w-[200px]">{doc.source}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {cat ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
                          cat.bgColor, cat.borderColor, cat.textColor
                        )}>
                          <cat.icon className="h-3 w-3" />
                          {cat.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <span className="capitalize text-xs text-gray-500">{doc.sensitivity}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
                        s.cls
                      )}>
                        <s.icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </td>

                    <td className="hidden px-5 py-3.5 text-xs text-gray-400 lg:table-cell">
                      {formatDate(doc.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Upload modal ────────────────────────────────────── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); handleUploaded() }}
        />
      )}
    </div>
  )
}
