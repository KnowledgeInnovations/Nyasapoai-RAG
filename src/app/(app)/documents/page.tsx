import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import DocumentsClient from '@/components/app/DocumentsClient'
import type { Document } from '@/types'

export const metadata: Metadata = { title: 'Documents — NyansapoAI' }

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let documents: Document[] = []

  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .order('created_at', { ascending: false })

      documents = (data as Document[]) ?? []
    }
  }

  return <DocumentsClient initialDocuments={documents} />
}
