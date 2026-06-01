import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, MessageSquare, AlertTriangle, TrendingUp, CheckCircle2, Crown } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/documentCategories'
import { cn } from '@/lib/utils'
import DashboardShell from '@/components/app/DashboardShell'
import { StatCard, QueryList, PlaceholderCard, DashEmpty } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Executive Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function ExecutiveDashboard() {
  const membership = await getMembership()
  if (!membership || !ALLOWED.includes(membership.role)) redirect('/ask')

  const supabase = await createClient()
  const service  = svc()
  const tid      = membership.tenant_id
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [
    { count: docCount },
    { count: chunkCount },
    { count: convsTotal },
    { count: convsMonth },
    { data: recentConvs },
    { data: docs },
    { data: riskyConvs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'ready'),
    service.from('document_chunks').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', monthAgo),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(6),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(8),
    supabase.from('conversations').select('id, query, risks').eq('tenant_id', tid).not('risks', 'eq', '[]').order('created_at', { ascending: false }).limit(4),
  ])

  const catCounts = CATEGORIES.map(cat => ({
    cat,
    count: docs?.filter(d => d.department === cat.value).length ?? 0,
  })).filter(c => c.count > 0)

  const totalRisks = (riskyConvs ?? []).reduce((a, c) => a + (c.risks?.length ?? 0), 0)
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Executive Dashboard" description="Company-wide KPIs, document intelligence, and real-time alerts for leadership." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText}      label="Documents Indexed"    value={String(docCount ?? 0)}   sub={`${chunkCount ?? 0} knowledge chunks`}  live color="text-indigo-600 bg-indigo-50" />
        <StatCard icon={MessageSquare} label="AI Queries (30 days)" value={String(convsMonth ?? 0)} sub={`${convsTotal ?? 0} all-time`}           live color="text-brand bg-brand-light" />
        <StatCard icon={AlertTriangle} label="Risks Flagged"        value={String(totalRisks)}      sub="Identified in AI answers"               live color="text-amber-600 bg-amber-50" />
        <StatCard icon={TrendingUp}    label="Revenue (MTD)"        value="N/A"                     sub="Connect ERP to track"                        color="text-green-600 bg-green-50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">Documents by Department</h2>
              <p className="mt-0.5 text-xs text-gray-400">{docCount ?? 0} indexed across {catCounts.length} categories</p>
            </div>
            <Link href="/documents" className="text-xs font-semibold text-brand hover:underline">Manage &rarr;</Link>
          </div>
          {catCounts.length ? (
            <ul className="divide-y divide-gray-100 px-5">
              {catCounts.map(({ cat, count }) => (
                <li key={cat.value} className="flex items-center gap-3 py-3.5">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', cat.bgColor, cat.borderColor)}>
                    <cat.icon className={cn('h-4 w-4', cat.textColor)} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div className={cn('h-full rounded-full', cat.bgColor.replace('-50', '-400'))}
                        style={{ width: `${Math.min(100, (count / (docCount || 1)) * 100)}%` }} />
                    </div>
                    <span className="w-5 text-right text-xs font-bold text-gray-500">{count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <DashEmpty icon={Crown} text="No documents yet" sub="Upload documents to see the breakdown" />
          )}
        </div>

        <QueryList convs={recentConvs} />
      </div>

      {riskyConvs && riskyConvs.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-200/60 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Outstanding Risks &amp; Issues</h2>
          </div>
          <ul className="divide-y divide-amber-200/40 px-5">
            {riskyConvs.map(c =>
              c.risks?.map((risk: string, i: number) => (
                <li key={`${c.id}-${i}`} className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm text-amber-800">{risk}</p>
                    <p className="mt-0.5 text-[11px] text-amber-600/70">From query: {c.query}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <PlaceholderCard label="Sales Performance" />
        <PlaceholderCard label="Employee Headcount" />
        <PlaceholderCard label="Project Status Overview" />
      </div>
    </DashboardShell>
  )
}
