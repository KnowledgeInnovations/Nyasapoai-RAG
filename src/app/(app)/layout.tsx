import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect('/auth/login')

  return <AppShell user={data.user}>{children}</AppShell>
}
