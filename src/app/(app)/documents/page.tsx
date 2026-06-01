import type { Metadata } from 'next'
import { getMembership, createClient } from '@/lib/supabase/server'
import DocumentsClient from '@/components/app/DocumentsClient'
import type { Document } from '@/types'
import { mergeWithDbCategories, type DbCategory, type CategoryInit } from '@/lib/documentCategories'

export const metadata: Metadata = { title: 'Documents — Devtraco Plus' }

export default async function DocumentsPage() {
  const membership = await getMembership()

  let documents: Document[] = []
  let canUpload = false
  let initialCategories = mergeWithDbCategories([])

  if (membership) {
    canUpload = membership.role === 'senior' || membership.role === 'middle'

    const supabase = await createClient()
    const [{ data: docs }, { data: dbCats }] = await Promise.all([
      supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .order('created_at', { ascending: false }),
      supabase
        .from('tenant_categories')
        .select('id, value, label, description, icon_name, color_name')
        .eq('tenant_id', membership.tenant_id),
    ])

    documents         = (docs    as Document[])   ?? []
    initialCategories = mergeWithDbCategories((dbCats as DbCategory[]) ?? [])
  }

  return (
    <DocumentsClient
      initialDocuments={documents}
      canUpload={canUpload}
      initialCategories={initialCategories}
    />
  )
}
