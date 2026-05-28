'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, FileText, BarChart3, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/ask',       icon: MessageSquare, label: 'Ask AI' },
  { href: '/documents', icon: FileText,      label: 'Documents' },
  { href: '/insights',  icon: BarChart3,     label: 'Insights' },
  { href: '/settings',  icon: Settings,      label: 'Settings' },
]

interface Props {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export default function AppSidebar({ collapsed, mobileOpen, onClose, onToggle }: Props) {
  const pathname = usePathname()

  const inner = (
    <div className={cn(
      'flex h-full flex-col bg-navy border-r border-white/10 transition-all duration-300',
      collapsed ? 'w-14' : 'w-60'
    )}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-3">
        {collapsed ? (
          // Icon-only: just the DT badge
          <div className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold shadow-lg shadow-gold/25">
            <span className="text-[11px] font-black text-navy">DT</span>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold shadow-lg shadow-gold/25">
              <span className="text-[11px] font-black text-navy">DT</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Devtraco Plus</p>
              <p className="text-[10px] leading-tight text-white/35">Intelligence workspace</p>
            </div>
            {/* Mobile close button */}
            <button onClick={onClose}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition md:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 p-2 mt-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center rounded-xl transition-all duration-150',
                collapsed ? 'h-10 w-10 mx-auto justify-center' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-gold text-navy shadow-lg shadow-gold/20'
                  : 'text-white/55 hover:bg-white/10 hover:text-white'
              )}>
              <item.icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-navy' : 'text-white/40 group-hover:text-white/70'
              )} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Collapse toggle + branding ─────────────────────── */}
      <div className="shrink-0 border-t border-white/10 p-2">
        {/* Collapse/expand button — desktop only */}
        <button onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-white/40 hover:bg-white/10 hover:text-white transition">
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <><ChevronLeft className="h-4 w-4" /><span className="text-xs font-medium">Collapse</span></>
          }
        </button>

        {!collapsed && (
          <div className="mt-1 rounded-xl bg-white/5 border border-white/8 px-3 py-2 text-center">
            <p className="text-[10px] text-white/25">Powered by</p>
            <p className="text-xs font-semibold text-white/40">NyansapoAI</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop — inline, animated width */}
      <div className="hidden md:block shrink-0 overflow-hidden" style={{ width: collapsed ? 56 : 240, transition: 'width 300ms ease' }}>
        {inner}
      </div>

      {/* Mobile — fixed overlay drawer from left */}
      <div className={cn(
        'fixed left-0 top-0 z-50 h-full md:hidden transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {inner}
      </div>
    </>
  )
}
