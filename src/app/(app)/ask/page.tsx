import type { Metadata } from 'next'
import AskInterface from '@/components/app/AskInterface'

export const metadata: Metadata = { title: 'Ask' }

export default function AskPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ask your documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ask any question — answers are grounded in your uploaded documents with full citations.
        </p>
      </div>
      <AskInterface />
    </div>
  )
}
