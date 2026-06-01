import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { HeartHandshake, Star, MessageSquare, ClipboardList } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Client Service Dashboard — Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function ClientServiceDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const weekAgo  = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { count: legalCount },
    { count: convsWeek },
    { count: convsTotal },
    { data: recentConvs },
    { data: legalDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('department', 'legal').eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', weekAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'legal').order('created_at', { ascending: false }).limit(8),
  ])

  const cat = CATEGORIES.find(c => c.value === 'legal')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Client Service Dashboard" description="Onboarding status, follow-up activities, payments, and customer satisfaction." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HeartHandshake} label="Legal & Client Docs"   value={String(legalCount ?? 0)} sub="Permits, deeds & compliance" live color="text-cyan-600 bg-cyan-50" />
        <StatCard icon={MessageSquare}  label="AI Queries (7 days)"   value={String(convsWeek ?? 0)}  sub={`${convsTotal ?? 0} all-time`} live color="text-brand bg-brand-light" />
        <StatCard icon={ClipboardList}  label="Open Client Requests"  value="—"                       sub="Connect CRM to track"             color="text-amber-600 bg-amber-50" />
        <StatCard icon={Star}           label="Satisfaction Score"    value="—"                       sub="Connect survey tool to track"     color="text-purple-600 bg-purple-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Client Onboarding Status" />
        <PlaceholderCard label="Payment Follow-up Tracking" />
        <PlaceholderCard label="Inspection Schedules" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={legalDocs} cat={cat} title="Legal & Compliance Documents" emptyText="No legal documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard label="Client Communication History" />
        <PlaceholderCard label="Service Response Times" />
      </div>
    </DashboardShell>
  )
}
