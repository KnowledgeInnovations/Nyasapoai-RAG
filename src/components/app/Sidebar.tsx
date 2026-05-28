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
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Devtraco header */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
          <span className="text-xs font-bold text-white">DT</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Devtraco Plus</p>
          <p className="text-[10px] text-gray-400 leading-none">Intelligence workspace</p>
        </div>
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
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-brand-light hover:text-brand'
              )}
            >
              <item.icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Powered by */}
      <div className="border-t border-gray-100 px-5 py-4">
        <p className="text-[10px] text-gray-400">
          Powered by{' '}
          <span className="font-semibold text-gray-500">NyansapoAI</span>
        </p>
      </div>
    </aside>
  )
}
