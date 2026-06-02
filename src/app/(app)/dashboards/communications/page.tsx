import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Radio, Mail, MessageSquare, Users } from 'lucide-react'
import { getMembership, createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import DashboardShell from '@/components/app/DashboardShell'
import DashboardInsight from '@/components/app/DashboardInsight'
import { StatCard, QueryList } from '@/components/app/DashboardWidgets'

export const metadata: Metadata = { title: 'Communications Dashboard - Devtraco Plus' }

const ALLOWED = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

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
  ] = await Promise.all([
    service.from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('status', 'ready'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).gte('created_at', weekAgo),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tid),
    supabase.from('conversations').select('id, query, created_at, risks').eq('tenant_id', tid).order('created_at', { ascending: false }).limit(5),
  ])

  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardShell title="Communications Dashboard" description="Internal announcements, staff engagement, and communication effectiveness from your documents." lastUpdated={now}>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Radio}         label="Documents Indexed"   value={String(docCount ?? 0)}   sub="Workspace knowledge"           live color="text-blue-600 bg-blue-50" />
        <StatCard icon={MessageSquare} label="AI Queries (7 days)" value={String(convsWeek ?? 0)}  sub={`${convsTotal ?? 0} all-time`} live color="text-brand bg-brand-light" />
        <StatCard icon={Mail}          label="Key Announcements"   value="AI"                      sub="Analysed from documents"       live color="text-indigo-600 bg-indigo-50" />
        <StatCard icon={Users}         label="Staff Engagement"    value="AI"                      sub="Analysed from documents"       live color="text-green-600 bg-green-50" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardInsight
          label="Key Announcements"
          question="What are the most important internal announcements, policy changes, or directives that have been communicated recently according to the uploaded documents?" />
        <DashboardInsight
          label="Staff Engagement"
          question="What do the documents reveal about staff engagement, morale, feedback, or participation in company programmes? Are there any concerns or positive signals?" />
        <DashboardInsight
          label="Communication Gaps"
          question="Are there any issues with communication breakdown, low acknowledgment rates, unresponded queries, or information silos mentioned in the documents?" />
      </div>

      <QueryList convs={recentConvs} />
    </DashboardShell>
  )
}
