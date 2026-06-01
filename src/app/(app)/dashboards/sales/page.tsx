import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TrendingUp, Target, MessageSquare, FileText } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Sales Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function SalesDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const weekAgo  = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { count: contractCount },
    { count: convsWeek },
    { count: convsTotal },
    { data: recentConvs },
    { data: contractDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('department', 'contracts').eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', weekAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'contracts').order('created_at', { ascending: false }).limit(8),
  ])

  const cat = CATEGORIES.find(c => c.value === 'contracts')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Sales Dashboard" description="Leads, pipeline status, reservations, and sales performance metrics." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText}      label="Contracts Indexed"      value={String(contractCount ?? 0)} sub="Ready for AI search"         live color="text-amber-600 bg-amber-50" />
        <StatCard icon={MessageSquare} label="AI Queries (7 days)"    value={String(convsWeek ?? 0)}     sub={`${convsTotal ?? 0} all-time`} live color="text-brand bg-brand-light" />
        <StatCard icon={TrendingUp}    label="Leads Generated"        value="N/A"                        sub="Connect CRM to track"               color="text-green-600 bg-green-50" />
        <StatCard icon={Target}        label="Sales Target vs Actual" value="N/A"                        sub="Connect ERP to track"               color="text-purple-600 bg-purple-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Lead Conversion Rate" />
        <PlaceholderCard label="Reservations Made" />
        <PlaceholderCard label="Top Sales Executives" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={contractDocs} cat={cat} title="Sales Contracts" emptyText="No contracts uploaded yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard label="Sales Pipeline Status" />
        <PlaceholderCard label="Customer Engagement and Lead Scoring" />
      </div>
    </DashboardShell>
  )
}
