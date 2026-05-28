'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare, FileText, BarChart3, Settings,
  ChevronLeft, ChevronRight, X, Plus, History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryItem {
  id: string
  query: string
  response: string
  risks: string[]
  recommendations: string[]
  created_at: string
}

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
  const isAsk    = pathname.startsWith('/ask')

  const [history,      setHistory]      = useState<HistoryItem[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)

  const fetchHistory = useCallback(() => {
    fetch('/api/chat')
      .then(r => r.json())
      .then(d => setHistory(d.conversations ?? []))
      .catch(() => {})
  }, [])

  // Load history when on ask route
  useEffect(() => {
    if (isAsk) fetchHistory()
    else setHistory([])
  }, [isAsk, fetchHistory])

  // Listen for refresh events from AskInterface
  useEffect(() => {
    const handler = () => { if (isAsk) fetchHistory() }
    window.addEventListener('refresh-chat-history', handler)
    return () => window.removeEventListener('refresh-chat-history', handler)
  }, [isAsk, fetchHistory])

  // Listen for conversation open (to highlight active item)
  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<HistoryItem>).detail
      setActiveConvId(item.id)
    }
    window.addEventListener('open-conversation', handler)
    return () => window.removeEventListener('open-conversation', handler)
  }, [])

  // Reset active when new chat starts
  useEffect(() => {
    const handler = () => setActiveConvId(null)
    window.addEventListener('new-chat', handler)
    return () => window.removeEventListener('new-chat', handler)
  }, [])

  function handleNewChat() {
    setActiveConvId(null)
    window.dispatchEvent(new CustomEvent('new-chat'))
    onClose()
  }

  function handleOpenConversation(item: HistoryItem) {
    setActiveConvId(item.id)
    window.dispatchEvent(new CustomEvent('open-conversation', { detail: item }))
    onClose()
  }

  // Group history by date
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86_400_000).toDateString()
  const groups: { label: string; items: HistoryItem[] }[] = []
  const todays    = history.filter(i => new Date(i.created_at).toDateString() === today)
  const yesterdays = history.filter(i => new Date(i.created_at).toDateString() === yesterday)
  const older     = history.filter(i => {
    const d = new Date(i.created_at).toDateString()
    return d !== today && d !== yesterday
  })
  if (todays.length)     groups.push({ label: 'Today',     items: todays })
  if (yesterdays.length) groups.push({ label: 'Yesterday', items: yesterdays })
  if (older.length)      groups.push({ label: 'Earlier',   items: older })

  const inner = (
    <div className={cn(
      'flex h-full flex-col bg-navy border-r border-white/10 transition-all duration-300',
      collapsed ? 'w-14' : 'w-60'
    )}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-3">
        {collapsed ? (
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
            <button onClick={onClose}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition md:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Body: nav + history ─────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Nav items */}
        <nav className="shrink-0 space-y-1 p-2 mt-1">
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
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Chat history — only when on /ask and sidebar is expanded */}
        {isAsk && !collapsed && (
          <div className="flex flex-1 flex-col overflow-hidden border-t border-white/10 mt-2 pt-2">
            {/* New Chat button */}
            <div className="px-2 pb-2 shrink-0">
              <button onClick={handleNewChat}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-white/20 px-3 py-2 text-xs font-semibold text-white/50 transition hover:border-gold/40 hover:bg-white/5 hover:text-gold">
                <Plus className="h-3.5 w-3.5" /> New Chat
              </button>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
              {groups.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <History className="mx-auto h-5 w-5 text-white/20 mb-1.5" />
                  <p className="text-[11px] text-white/25">No conversations yet</p>
                </div>
              ) : groups.map(group => (
                <div key={group.label}>
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/25">
                    {group.label}
                  </p>
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => handleOpenConversation(item)}
                      className={cn(
                        'w-full rounded-xl px-3 py-2 text-left text-xs transition',
                        activeConvId === item.id
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-white/40 hover:bg-white/8 hover:text-white/70'
                      )}>
                      <p className="truncate leading-relaxed">{item.query}</p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: collapse toggle ─────────────────────────── */}
      <div className="shrink-0 border-t border-white/10 p-2">
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
      <div className="hidden md:block shrink-0 overflow-hidden"
        style={{ width: collapsed ? 56 : 240, transition: 'width 300ms ease' }}>
        {inner}
      </div>
      <div className={cn(
        'fixed left-0 top-0 z-50 h-full md:hidden transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {inner}
      </div>
    </>
  )
}
