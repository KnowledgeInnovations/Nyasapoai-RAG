import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Banknote, TrendingDown, MessageSquare, PiggyBank } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, DocList, QueryList, PlaceholderCard } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Finance Dashboard — Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function FinanceDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [
    { count: financeDocCount },
    { count: convsMonth },
    { count: convsTotal },
    { data: recentConvs },
    { data: financeDocs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('department', 'finance').eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', monthAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).eq('department', 'finance').order('created_at', { ascending: false }).limit(8),
  ])

  const cat = CATEGORIES.find(c => c.value === 'finance')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Finance Dashboard" description="Revenue collection, outstanding payments, cash flow, and financial risk indicators." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote}      label="Finance Documents"     value={String(financeDocCount ?? 0)} sub="Invoices, budgets & schedules" live color="text-green-600 bg-green-50" />
        <StatCard icon={MessageSquare} label="AI Queries (30 days)"  value={String(convsMonth ?? 0)}      sub={`${convsTotal ?? 0} all-time`}  live color="text-brand bg-brand-light" />
        <StatCard icon={PiggyBank}     label="Revenue (MTD)"         value="—"                            sub="Connect ERP to track"               color="text-indigo-600 bg-indigo-50" />
        <StatCard icon={TrendingDown}  label="Outstanding Payments"  value="—"                            sub="Connect accounting to track"        color="text-red-600 bg-red-50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Accounts Receivable" />
        <PlaceholderCard label="Cash Flow Summary" />
        <PlaceholderCard label="Budget Tracking" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocList docs={financeDocs} cat={cat} title="Finance Documents" emptyText="No finance documents yet" />
        <QueryList convs={recentConvs} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Financial Performance by Project" />
        <PlaceholderCard label="Payment Trends" />
        <PlaceholderCard label="Financial Risk Indicators" />
      </div>
    </DashboardShell>
  )
}
