import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Radio, Mail, MessageSquare, Users } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Communications Dashboard — Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function CommunicationsDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const weekAgo  = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { count: docCount },
    { count: convsWeek },
    { count: convsTotal },
    { data: recentConvs },
    { data: generalDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', weekAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'general').order('created_at', { ascending: false }).limit(8),
  ])

  const cat = CATEGORIES.find(c => c.value === 'general')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Communications Dashboard" description="Internal communication reach, staff engagement, and announcement tracking." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Radio}         label="Workspace Documents"   value={String(docCount ?? 0)}   sub="All indexed files"            live color="text-blue-600 bg-blue-50" />
        <StatCard icon={MessageSquare} label="AI Queries (7 days)"   value={String(convsWeek ?? 0)}  sub={`${convsTotal ?? 0} all-time`} live color="text-brand bg-brand-light" />
        <StatCard icon={Mail}          label="Email Open Rate"       value="—"                       sub="Connect email tool to track"      color="text-indigo-600 bg-indigo-50" />
        <StatCard icon={Users}         label="Staff Engaged"         value="—"                       sub="Connect comms tool to track"      color="text-green-600 bg-green-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Internal Communication Reach" />
        <PlaceholderCard label="Email Acknowledgment Rates" />
        <PlaceholderCard label="Staff Engagement Metrics" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={generalDocs} cat={cat} title="Communications Documents" emptyText="No communications documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Communication Campaign Performance" />
        <PlaceholderCard label="Internal Announcements Tracker" />
        <PlaceholderCard label="Feedback & Survey Responses" />
      </div>
    </DashboardShell>
  )
}
