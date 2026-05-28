import type { Metadata } from 'next'
import { getMembership, createClient } from '@/lib/supabase/server'
import DocumentsClient from '@/components/app/DocumentsClient'
import type { Document } from '@/types'

export const metadata: Metadata = { title: 'Documents — Devtraco Plus' }

export default async function DocumentsPage() {
  // Both come from cache warmed by the layout — no extra network calls.
  const membership = await getMembership()

  let documents: Document[] = []
  let canUpload = false

  if (membership) {
    canUpload = membership.role === 'senior' || membership.role === 'middle'

    const supabase = await createClient()
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false })

    documents = (data as Document[]) ?? []
  }

  return <DocumentsClient initialDocuments={documents} canUpload={canUpload} />
}
