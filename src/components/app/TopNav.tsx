'use client'

import { useState } from 'react'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Props {
  user: SupabaseUser
}

export default function AppTopNav({ user }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayName = user.user_metadata?.name || user.email || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-50">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="max-w-[120px] truncate font-medium text-gray-700">
              {displayName}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => { router.push('/settings'); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
