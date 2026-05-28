import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AppSidebar from '@/components/app/Sidebar'
import AppTopNav from '@/components/app/TopNav'
import type { User } from '@supabase/supabase-js'

const DEMO_USER: Partial<User> = {
  id: 'demo-user',
  email: 'demo@devtraco.com',
  user_metadata: { name: 'Demo User' },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('demo_session')?.value === 'active'

  let user: Partial<User> | null = null

  if (isDemo) {
    user = DEMO_USER
  } else {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  if (!user) redirect('/auth/login')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopNav user={user as User} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
