import { redirect } from 'next/navigation'
import { getUser, getMembership } from '@/lib/supabase/server'
import AppShell from '@/components/app/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  // Warm the membership cache so child pages (Documents, Settings) get it free.
  await getMembership()

  return <AppShell user={user}>{children}</AppShell>
}
