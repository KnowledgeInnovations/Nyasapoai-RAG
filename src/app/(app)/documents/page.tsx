import type { Metadata } from 'next'
import DocumentList from '@/components/app/DocumentList'

export const metadata: Metadata = { title: 'Documents — Devtraco Plus' }

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage Devtraco Plus reports, contracts, and project files.
          </p>
        </div>
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Upload document
          <input id="file-upload" type="file" className="sr-only" multiple accept=".pdf,.docx,.csv,.xlsx" />
        </label>
      </div>
      <DocumentList />
    </div>
  )
}
