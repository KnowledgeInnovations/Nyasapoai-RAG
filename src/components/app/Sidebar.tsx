'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, FileText, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/ask', icon: MessageSquare, label: 'Ask AI', description: 'Query your documents' },
  { href: '/documents', icon: FileText, label: 'Documents', description: 'Manage uploads' },
  { href: '/insights', icon: BarChart3, label: 'Insights', description: 'Analytics & trends' },
  { href: '/settings', icon: Settings, label: 'Settings', description: 'Workspace config' },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-navy border-r border-white/10">
      {/* Logo header */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold shadow-lg shadow-gold/25">
          <span className="text-[11px] font-black text-navy">DT</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Devtraco Plus</p>
          <p className="text-[10px] text-white/35 leading-tight">Intelligence workspace</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 mt-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group',
                active
                  ? 'bg-gold text-navy shadow-lg shadow-gold/20'
                  : 'text-white/55 hover:bg-white/8 hover:text-white'
              )}>
              <item.icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-navy' : 'text-white/40 group-hover:text-white/70'
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom branding */}
      <div className="shrink-0 p-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 text-center">
          <p className="text-[10px] text-white/25">Powered by</p>
          <p className="text-xs font-semibold text-white/40">NyansapoAI</p>
        </div>
      </div>
    </aside>
  )
}
