import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { HardHat, Ruler, MessageSquare, Hammer } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Development Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function DevelopmentDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const weekAgo  = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { count: siteReportCount },
    { count: designCount },
    { count: convsWeek },
    { count: convsTotal },
    { data: recentConvs },
    { data: siteDocs },
    { data: designDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('department', 'site-reports').eq('status', 'ready'),
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('department', 'design-plans').eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', weekAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'site-reports').order('created_at', { ascending: false }).limit(5),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'design-plans').order('created_at', { ascending: false }).limit(5),
  ])

  const siteReportCat = CATEGORIES.find(c => c.value === 'site-reports')
  const allDevDocs = [...(siteDocs ?? []), ...(designDocs ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Development Dashboard" description="Project progress, construction milestones, contractor performance, and budget tracking." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HardHat}       label="Site Reports"         value={String(siteReportCount ?? 0)} sub="Progress and inspection reports" live color="text-orange-600 bg-orange-50" />
        <StatCard icon={Ruler}         label="Design and Plans"     value={String(designCount ?? 0)}     sub="Architectural drawings"         live color="text-cyan-600 bg-cyan-50" />
        <StatCard icon={MessageSquare} label="AI Queries (7 days)"  value={String(convsWeek ?? 0)}       sub={`${convsTotal ?? 0} all-time`}  live color="text-brand bg-brand-light" />
        <StatCard icon={Hammer}        label="Active Projects"      value="N/A"                          sub="Connect PMIS to track"              color="text-purple-600 bg-purple-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Construction Milestones" />
        <PlaceholderCard label="Contractor Performance" />
        <PlaceholderCard label="Budget vs Actual Costs" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={allDevDocs} cat={siteReportCat} title="Site Reports and Design Plans" emptyText="No development documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Project Delays and Alerts" />
        <PlaceholderCard label="Procurement Status" />
        <PlaceholderCard label="Change Request Management" />
      </div>
    </DashboardShell>
  )
}
