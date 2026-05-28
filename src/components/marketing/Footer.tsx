import Link from 'next/link'

const links = [
  { href: '/security', label: 'Security' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/auth/login', label: 'Sign in' },
]

export default function MarketingFooter() {
  return (
    <footer className="bg-navy-mid border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold shadow-lg shadow-gold/20">
              <span className="text-xs font-black text-navy">DT</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Devtraco Plus</p>
              <p className="text-[11px] text-white/35 leading-tight">Powered by NyansapoAI · Knowledge Innovations</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm text-white/45 transition hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} Devtraco Plus · Knowledge Innovations Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
