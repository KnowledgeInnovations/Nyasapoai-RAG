'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/security', label: 'Security' },
  { href: '/contact', label: 'Contact' },
]

export default function MarketingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        scrolled
          ? 'bg-navy/95 backdrop-blur-xl shadow-xl shadow-black/30 border-b border-white/5'
          : 'bg-transparent'
      )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold shadow-lg shadow-gold/30">
              <span className="text-[11px] font-black text-navy">DT</span>
            </div>
            <span className="hidden sm:block text-sm font-extrabold text-white tracking-tight">Devtraco Plus</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/auth/login"
            className="hidden md:inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold hover:text-navy hover:border-gold">
            Sign in <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button onClick={() => setOpen(true)} aria-label="Open menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Overlay ──────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* ── Drawer — slides from LEFT ─────────────────────────── */}
      <div className={cn(
        'fixed left-0 top-0 z-50 flex h-full w-72 max-w-[82vw] flex-col',
        'bg-navy border-r border-white/10 shadow-2xl shadow-black/50',
        'transition-transform duration-300 ease-in-out md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
              <span className="text-[11px] font-black text-navy">DT</span>
            </div>
            <span className="text-sm font-extrabold text-white">Devtraco Plus</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center rounded-xl px-4 py-3.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-white/10 space-y-3">
          <Link href="/auth/login" onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-bold text-navy transition hover:bg-gold-dark shadow-lg shadow-gold/20">
            Sign in to Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-center text-[11px] text-white/25">Powered by NyansapoAI</p>
        </div>
      </div>
    </>
  )
}
