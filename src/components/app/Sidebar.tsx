'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, FileText, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/ask', icon: MessageSquare, label: 'Ask' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/insights', icon: BarChart3, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <span className="text-lg font-bold text-indigo-600">Nyansapo</span>
        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
          AI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn('h-5 w-5', active ? 'text-indigo-600' : 'text-gray-400')}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
