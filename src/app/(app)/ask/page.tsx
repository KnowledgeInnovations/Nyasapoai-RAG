import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AskInterface from '@/components/app/AskInterface'

export const metadata: Metadata = { title: 'Ask AI — Devtraco Plus' }

export default async function AskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AskInterface userName={userName} />
    </div>
  )
}
