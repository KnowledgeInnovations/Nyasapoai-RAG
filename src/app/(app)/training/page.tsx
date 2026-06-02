import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import TrainingClient from '@/components/app/TrainingClient'

export const metadata: Metadata = { title: 'AI Training - Devtraco Plus' }

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export interface TrainingDoc {
  id: string
  title: string
  source: string
  department: string | null
  status: string
  file_path: string
  created_at: string
  chunkCount: number
  lastTrainedAt: string | null
}

export default async function TrainingPage() {
  const membership = await getMembership()
  if (!membership || membership.role !== 'admin') redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id

  // Fetch all documents + their chunk counts + last trained timestamp
  const [{ data: docs }, { data: allChunks }] = await Promise.all([
    service
      .from('documents')
      .select('id, title, source, department, status, file_path, created_at')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false }),
    service
      .from('document_chunks')
      .select('document_id, created_at')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: true }),
  ])

  // Build chunk count + last trained map
  const chunkMap = new Map<string, { count: number; lastAt: string }>()
  for (const c of allChunks ?? []) {
    const e = chunkMap.get(c.document_id)
    if (!e) chunkMap.set(c.document_id, { count: 1, lastAt: c.created_at })
    else { e.count++; e.lastAt = c.created_at }
  }

  const trainingDocs: TrainingDoc[] = (docs ?? []).map(d => ({
    id:           d.id,
    title:        d.title,
    source:       d.source,
    department:   d.department,
    status:       d.status,
    file_path:    d.file_path,
    created_at:   d.created_at,
    chunkCount:   chunkMap.get(d.id)?.count ?? 0,
    lastTrainedAt: chunkMap.get(d.id)?.lastAt ?? null,
  }))

  const trainedCount   = trainingDocs.filter(d => d.chunkCount > 0).length
  const untrainedCount = trainingDocs.filter(d => d.chunkCount === 0).length

  return (
    <TrainingClient
      docs={trainingDocs}
      trainedCount={trainedCount}
      untrainedCount={untrainedCount}
    />
  )
}
