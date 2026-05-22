import type { Metadata } from 'next'
import DocumentList from '@/components/app/DocumentList'

export const metadata: Metadata = { title: 'Documents' }

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage your organisation's knowledge base.
          </p>
        </div>
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Upload document
          <input id="file-upload" type="file" className="sr-only" multiple accept=".pdf,.docx,.csv,.xlsx" />
        </label>
      </div>
      <DocumentList />
    </div>
  )
}
