import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Megaphone, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Marketing Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function MarketingDashboard() {
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
    <DashboardShell title="Marketing Dashboard" description="Campaign performance, lead generation metrics, and marketing ROI." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Megaphone}     label="Workspace Documents"  value={String(docCount ?? 0)}   sub="Available for AI search"       live color="text-purple-600 bg-purple-50" />
        <StatCard icon={MessageSquare} label="AI Queries (30 days)" value={String(convsMonth ?? 0)} sub={`${convsTotal ?? 0} all-time`}  live color="text-brand bg-brand-light" />
        <StatCard icon={TrendingUp}    label="Leads Generated"      value="N/A"                     sub="Connect CRM to track"               color="text-amber-600 bg-amber-50" />
        <StatCard icon={BarChart3}     label="Marketing ROI"        value="N/A"                     sub="Connect analytics to track"         color="text-green-600 bg-green-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Campaign Performance" />
        <PlaceholderCard label="Lead Source Analysis" />
        <PlaceholderCard label="Qualified Leads Received" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={generalDocs} cat={cat} title="Marketing Documents" emptyText="No marketing documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceholderCard label="Customer Engagement Trends" />
        <PlaceholderCard label="Digital Marketing Performance" />
      </div>
    </DashboardShell>
  )
}
