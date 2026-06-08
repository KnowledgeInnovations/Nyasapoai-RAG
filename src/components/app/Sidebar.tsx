'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare, FileText, LayoutDashboard, Settings, Brain,
  ChevronLeft, ChevronRight, X, Plus, History, Trash2,
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

// New roles + legacy roles (senior/middle/junior) — remove legacy entries once DB is migrated
const DASHBOARD_ROLES = ['admin', 'exco', 'senior_manager', 'senior', 'middle']

function getNavItems(role: string) {
  return [
    { href: '/ask',        icon: MessageSquare,   label: 'Ask AI'     },
    { href: '/documents',  icon: FileText,         label: 'Documents'  },
    ...(role === 'admin'               ? [{ href: '/training',   icon: Brain,           label: 'Training'   }] : []),
    ...(DASHBOARD_ROLES.includes(role) ? [{ href: '/dashboards', icon: LayoutDashboard, label: 'Dashboards' }] : []),
    { href: '/settings',   icon: Settings,         label: 'Settings'   },
  ]
}

interface Props {
  role: string
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onToggle: () => void
}

// Generate a short readable title from the query
function deriveTitle(query: string): string {
  const q = query.trim().replace(/[?!.]+$/, '')
  if (q.split(/\s+/).length <= 3) return q || 'Quick chat'
  const words = q.split(/\s+/).slice(0, 6)
  return words.join(' ') + (q.split(/\s+/).length > 6 ? '…' : '')
}

export default function AppSidebar({ role, collapsed, mobileOpen, onClose, onToggle }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const isAsk    = pathname.startsWith('/ask')
  const navItems = useMemo(() => getNavItems(role), [role])

  // Prefetch all nav routes immediately so link clicks feel instant
  useEffect(() => {
    navItems.forEach(({ href }) => router.prefetch(href))
  }, [router, navItems])

  const [history,      setHistory]      = useState<HistoryItem[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const fetchHistory = useCallback(() => {
    fetch('/api/chat')
      .then(r => r.json())
      .then(d => setHistory(d.conversations ?? []))
      .catch(() => {})
  }, [])

  // Load history when on ask route
  useEffect(() => {
    if (isAsk) fetchHistory()
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  function confirmDelete(e: React.MouseEvent, item: HistoryItem) {
    e.stopPropagation()
    setDeleteTarget({ id: item.id, title: deriveTitle(item.query) })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setDeletingId(id)
    setDeleteTarget(null)
    try {
      const res  = await fetch(`/api/chat?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        console.error('Delete failed:', data.error)
        return
      }
      setHistory(prev => prev.filter(h => h.id !== id))
      if (activeConvId === id) {
        setActiveConvId(null)
        window.dispatchEvent(new CustomEvent('new-chat'))
      }
    } catch (e) {
      console.error('Delete request error:', e)
    } finally {
      setDeletingId(null)
    }
  }

  // Group history by date — memoised so Date.now() isn't called on every render
  const { today, yesterday } = useMemo(() => {
    const now  = new Date()
    const prev = new Date(now)
    prev.setDate(prev.getDate() - 1)
    return { today: now.toDateString(), yesterday: prev.toDateString() }
  }, [])
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
          <div className="mx-auto flex shrink-0 items-center justify-center rounded-lg bg-white px-1.5 py-1 shadow-lg overflow-hidden">
            <img src="/devtraco-logo.png" alt="Devtraco Plus" className="h-5 w-auto object-contain" style={{ maxWidth: '40px' }} />
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-white px-2 py-1 shadow-lg overflow-hidden">
              <img src="/devtraco-logo.png" alt="Devtraco Plus" className="h-6 w-auto object-contain" style={{ maxWidth: '110px' }} />
            </div>
            <div className="min-w-0">
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
                    <div key={item.id}
                      className={cn(
                        'group relative flex items-center rounded-xl transition',
                        activeConvId === item.id
                          ? 'bg-white/15'
                          : 'hover:bg-white/8'
                      )}>
                      <button
                        onClick={() => handleOpenConversation(item)}
                        className="min-w-0 flex-1 px-3 py-2 text-left text-xs"
                      >
                        <p className={cn(
                          'truncate leading-relaxed pr-5',
                          activeConvId === item.id ? 'text-white font-medium' : 'text-white/40 group-hover:text-white/70'
                        )}>
                          {deriveTitle(item.query)}
                        </p>
                      </button>
                      <button
                        onClick={e => confirmDelete(e, item)}
                        disabled={deletingId === item.id}
                        title="Delete chat"
                        className="absolute right-2 hidden group-hover:flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/30 hover:text-red-400 transition disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
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
            <p className="text-xs font-semibold text-white/40">NyasapoAI</p>
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

      {/* ── Delete confirmation modal ─────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1629] p-6 shadow-2xl shadow-black/50">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/25">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Delete this chat?</h3>
            <p className="mt-1.5 text-sm text-white/45 leading-relaxed">
              <span className="font-medium text-white/70">&quot;{deleteTarget.title}&quot;</span> will be permanently removed and cannot be recovered.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
