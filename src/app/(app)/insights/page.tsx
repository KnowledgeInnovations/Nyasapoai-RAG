import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart3, FileText, MessageSquare, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, FolderOpen,
} from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/documentCategories'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const metadata: Metadata = { title: 'Insights — Devtraco Plus' }

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function InsightsPage() {
  const membership = await getMembership()
  const supabase   = await createClient()
  const service    = svc()
  const tid        = membership?.tenant_id

  // ── Fetch all stats in parallel ────────────────────────────
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [
    { count: docCount },
    { count: chunkCount },
    { count: convsTotal },
    { count: convsWeek },
    { data: recentConvs },
    { data: docs },
    { data: riskyConvs },
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid ?? '').eq('status', 'ready'),
    service.from('document_chunks').select('*', { count: 'exact', head: true }).eq('tenant_id', tid ?? ''),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid ?? ''),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid ?? '').gte('created_at', weekAgo),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid ?? '').order('created_at', { ascending: false }).limit(5),
    service.from('documents').select('id, title, department, status, created_at').eq('tenant_id', tid ?? '').order('created_at', { ascending: false }),
    supabase.from('conversations').select('id, query, risks').eq('tenant_id', tid ?? '').not('risks', 'eq', '[]').order('created_at', { ascending: false }).limit(3),
  ])

  // Category breakdown
  const catCounts = CATEGORIES.map(cat => ({
    cat,
    count: docs?.filter(d => d.department === cat.value).length ?? 0,
  })).filter(c => c.count > 0)

  const activeDocs   = docs?.filter(d => d.status === 'ready').length ?? 0
  const processingDocs = docs?.filter(d => d.status === 'processing').length ?? 0
  const totalRisks   = (riskyConvs ?? []).reduce((acc, c) => acc + (c.risks?.length ?? 0), 0)

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Insights</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organisation-wide document intelligence, activity, and trends.
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Documents indexed"
          value={String(docCount ?? 0)}
          sub={chunkCount ? `${chunkCount} chunks` : undefined}
          color="text-brand bg-brand-light"
        />
        <StatCard
          icon={MessageSquare}
          label="Total queries"
          value={String(convsTotal ?? 0)}
          sub={`${convsWeek ?? 0} this week`}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          icon={AlertTriangle}
          label="Risks flagged"
          value={String(totalRisks)}
          sub="from recent answers"
          color="text-amber-600 bg-amber-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Active documents"
          value={String(activeDocs)}
          sub={processingDocs ? `${processingDocs} processing` : 'all ready'}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* ── Two-column ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent queries */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent queries</h2>
            <p className="mt-0.5 text-xs text-gray-400">Latest questions asked across the workspace</p>
          </div>
          {recentConvs?.length ? (
            <ul className="divide-y divide-gray-100">
              {recentConvs.map(c => (
                <li key={c.id} className="flex items-start gap-3 px-5 py-3.5">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand/50" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">{c.query}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {c.risks?.length > 0 && (
                    <span className="shrink-0 mt-0.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {c.risks.length} risk{c.risks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={MessageSquare} text="No queries yet" sub="Start asking questions in Ask AI" />
          )}
        </div>

        {/* Documents by category */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Documents by category</h2>
            <p className="mt-0.5 text-xs text-gray-400">{activeDocs} indexed across {catCounts.length} categories</p>
          </div>
          {catCounts.length ? (
            <ul className="divide-y divide-gray-100 px-5">
              {catCounts.map(({ cat, count }) => (
                <li key={cat.value} className="flex items-center gap-3 py-3.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cat.bgColor} ${cat.borderColor}`}>
                    <cat.icon className={`h-4 w-4 ${cat.textColor}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${cat.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`}
                        style={{ width: `${Math.min(100, (count / (activeDocs || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-xs font-bold text-gray-500">{count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FolderOpen} text="No documents yet" sub={<Link href="/documents" className="text-brand hover:underline">Upload your first document</Link>} />
          )}
        </div>
      </div>

      {/* ── Flagged risks ───────────────────────────────────── */}
      {riskyConvs && riskyConvs.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="border-b border-amber-200/60 px-5 py-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Risks identified in recent answers</h2>
          </div>
          <ul className="divide-y divide-amber-200/40 px-5">
            {riskyConvs.map(c => (
              c.risks?.map((risk: string, ri: number) => (
                <li key={`${c.id}-${ri}`} className="flex items-start gap-3 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm text-amber-800">{risk}</p>
                    <p className="mt-0.5 text-[11px] text-amber-600/70">From query: {c.query}</p>
                  </div>
                </li>
              ))
            ))}
          </ul>
        </div>
      )}

      {/* ── All documents list ──────────────────────────────── */}
      {docs && docs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">All documents</h2>
              <p className="mt-0.5 text-xs text-gray-400">{docs.length} total in workspace</p>
            </div>
            <Link href="/documents" className="text-xs font-semibold text-brand hover:underline">
              Manage →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {docs.map(doc => {
              const cat = CATEGORIES.find(c => c.value === doc.department)
              return (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cat ? `${cat.bgColor} ${cat.borderColor}` : 'bg-gray-50 border-gray-200'}`}>
                    {cat
                      ? <cat.icon className={`h-4 w-4 ${cat.textColor}`} />
                      : <FileText className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{doc.title}</p>
                    {cat && <p className={`text-[11px] ${cat.textColor}`}>{cat.label}</p>}
                  </div>
                  <StatusChip status={doc.status} />
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Empty state — no documents at all */}
      {(!docs || docs.length === 0) && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Upload documents to see insights</p>
          <p className="mt-1 text-xs text-gray-400">Contracts, board reports, site files — all work.</p>
          <Link href="/documents"
            className="mt-4 inline-block rounded-xl border border-brand/30 bg-brand-light px-4 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition">
            Go to Documents
          </Link>
        </div>
      )}
    </div>
  )
}

/* ── Small helpers ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-xl p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-black text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  if (status === 'ready') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <CheckCircle2 className="h-3 w-3" /> Ready
    </span>
  )
  if (status === 'processing') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <Clock className="h-3 w-3" /> Processing
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
      Failed
    </span>
  )
}

function EmptyState({ icon: Icon, text, sub }: { icon: React.ElementType; text: string; sub: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-8 w-8 text-gray-300 mb-2" />
      <p className="text-sm font-medium text-gray-500">{text}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
