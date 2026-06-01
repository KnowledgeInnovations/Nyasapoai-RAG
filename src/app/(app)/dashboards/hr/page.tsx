import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Users, UserPlus, MessageSquare, Calendar } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'HR Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function HRDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [
    { count: docCount },
    { count: convsMonth },
    { count: convsTotal },
    { data: recentConvs },
    { data: generalDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', monthAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'general').order('created_at', { ascending: false }).limit(8),
  ])

  const cat = CATEGORIES.find(c => c.value === 'general')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="HR Dashboard" description="Headcount, recruitment, leave management, KPI tracking, and staff development." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users}         label="Workspace Documents"  value={String(docCount ?? 0)}   sub="All indexed files"            live color="text-rose-600 bg-rose-50" />
        <StatCard icon={MessageSquare} label="AI Queries (30 days)" value={String(convsMonth ?? 0)} sub={`${convsTotal ?? 0} all-time`} live color="text-brand bg-brand-light" />
        <StatCard icon={UserPlus}      label="Open Vacancies"       value="N/A"                     sub="Connect HRMS to track"            color="text-amber-600 bg-amber-50" />
        <StatCard icon={Calendar}      label="Leave Requests"       value="N/A"                     sub="Connect HRMS to track"            color="text-purple-600 bg-purple-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Employee Headcount" />
        <PlaceholderCard label="Recruitment Status" />
        <PlaceholderCard label="Performance Review Status" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={generalDocs} cat={cat} title="HR Documents" emptyText="No HR documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="KPI Tracking" />
        <PlaceholderCard label="Staff Turnover Trends" />
        <PlaceholderCard label="Training and Development Records" />
      </div>
    </DashboardShell>
  )
}
