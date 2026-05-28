'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Clock, CheckCircle2, XCircle, Upload, Loader2 } from 'lucide-react'
import type { Document } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  initialDocuments: Document[]
}

const statusConfig = {
  ready: { icon: CheckCircle2, label: 'Ready', color: 'text-green-600 bg-green-50' },
  processing: { icon: Clock, label: 'Processing', color: 'text-amber-600 bg-amber-50' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600 bg-red-50' },
}

export default function DocumentsClient({ initialDocuments }: Props) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFiles(files: FileList) {
    setUploading(true)
    setUploadError(null)

    for (const file of Array.from(files)) {
      const body = new FormData()
      body.append('file', file)
      body.append('sensitivity', 'internal')

      try {
        const res = await fetch('/api/documents/upload', { method: 'POST', body })
        const data = await res.json()

        if (!res.ok) {
          setUploadError(data.error ?? 'Upload failed')
        } else if (data.document) {
          setDocuments((prev) => [data.document as Document, ...prev])
        }
      } catch {
        setUploadError('Network error — please try again')
      }
    }

    setUploading(false)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage reports, contracts, and project files for AI-powered search.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><Upload className="h-4 w-4" /> Upload document</>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple
          accept=".pdf,.txt,.csv"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {documents.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center cursor-pointer hover:border-brand transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No documents yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click here or use the button above to upload a PDF, TXT, or CSV.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-600">Document</th>
                <th className="px-5 py-3 font-medium text-gray-600">Department</th>
                <th className="px-5 py-3 font-medium text-gray-600">Sensitivity</th>
                <th className="px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3 font-medium text-gray-600">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => {
                const s = statusConfig[doc.status]
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{doc.department ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className="capitalize text-gray-500">{doc.sensitivity}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                        <s.icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
