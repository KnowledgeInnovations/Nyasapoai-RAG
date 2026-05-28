import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2, FileText, MessageSquare, ShieldCheck,
  Zap, BookOpen, ArrowRight, CheckCircle2,
} from 'lucide-react'
import DemoChat from '@/components/marketing/DemoChat'
import FAQ from '@/components/marketing/FAQ'

export const metadata: Metadata = {
  title: 'Devtraco Plus — Intelligent Document Workspace',
  description: 'Ask questions across all your Devtraco project files, contracts, and site reports. Get cited answers in seconds.',
}

const features = [
  {
    icon: MessageSquare,
    title: 'Ask Anything',
    body: 'Ask questions in plain English across thousands of project files, contracts, and site reports. No search operators, no training needed.',
  },
  {
    icon: BookOpen,
    title: 'Cited Answers',
    body: 'Every response links directly to the source document and page number. Zero hallucinations — full accountability at every level.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    body: 'Role-based access control built in. Executives, managers, and teams see only what they are cleared for. Data never leaves your workspace.',
  },
]

const steps = [
  { n: '01', title: 'Upload your documents', body: 'Add PDFs, site reports, contracts, and spreadsheets. Drag-and-drop or upload in bulk. We handle extraction automatically.' },
  { n: '02', title: 'Ask in plain English', body: 'Type any business question naturally. Our AI searches across all your documents simultaneously in milliseconds.' },
  { n: '03', title: 'Get cited answers', body: 'Receive a precise answer with source citations, identified risks, and actionable recommendations you can act on immediately.' },
]

const stats = [
  { value: '2.3M+', label: 'Sq ft managed' },
  { value: '< 2s',  label: 'Response time' },
  { value: '100%',  label: 'Cited answers' },
  { value: '24 / 7', label: 'Always available' },
]

const trusted = [
  'SOC 2-ready architecture',
  'End-to-end encryption',
  'Role-based access control',
  'Data isolation per tenant',
  'Cited answers — no hallucinations',
]

const exampleQueries = [
  'What are the outstanding snagging items for East Ridge Block A?',
  'Show me all contracts expiring in the next 90 days',
  'What is the penalty clause in the Mensah & Sons agreement?',
  'Summarise the Q1 2026 project health across all sites',
  'Which subcontractors are behind schedule this quarter?',
  'What does the Airport Hills lease say about maintenance obligations?',
  'List all variations approved above GHS 50,000',
  'What safety incidents were reported on Cantonments Ridge in March?',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy text-white overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-gold/6 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-[22px] md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
                <Building2 className="h-3.5 w-3.5" />
                Powered by NyansapoAI · Built for Devtraco
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight xl:text-6xl">
                Every Project.
                <br />Every Decision.
                <br />
                <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  Intelligently Answered.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-white/55">
                Ask questions across all your Devtraco project files, contracts, and site
                reports. Get cited answers in seconds — not hours of searching.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-bold text-navy shadow-xl shadow-gold/25 transition hover:bg-yellow-400">
                  Sign in to Workspace <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#demo"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white">
                  See it in action
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-5">
                {[
                  { icon: ShieldCheck, text: 'Bank-grade encryption' },
                  { icon: FileText,    text: 'Always cited' },
                  { icon: Zap,         text: 'Sub-2s responses' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-white/40">
                    <Icon className="h-3.5 w-3.5 text-gold/60" />{text}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Building photo ──────────────────────────────── */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Glow behind card */}
              <div className="absolute inset-0 -z-10 scale-110 rounded-3xl bg-gold/10 blur-3xl" />

              <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50"
                style={{ height: 520 }}>
                {/* Arlo Cantonments — replace with local file: public/images/devtraco-building.jpg */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage: "url('https://propartners.com.gh/wp-content/uploads/2025/06/image-4-1024x652.png')",
                    backgroundColor: '#0f1629',
                  }}
                />
                {/* Bottom-fade overlay for contrast (sits above photo, below UI) */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />

                {/* Top badge */}
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-gold/40 bg-navy/70 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
                  <span className="text-xs font-semibold text-gold">Devtraco Development</span>
                </div>

                {/* Bottom info card */}
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-navy/75 px-5 py-4 backdrop-blur-md">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-base font-bold leading-tight text-white">Arlo Cantonments</p>
                      <p className="mt-0.5 text-xs text-white/50">18-floor luxury residences · Cantonments, Accra</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black leading-none text-gold">18F</p>
                      <p className="mt-0.5 text-[11px] text-white/40">Floors</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-300" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Floating stat chips */}
              <div className="absolute -right-4 top-16 rounded-2xl border border-white/10 bg-navy/80 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs text-white/40">Sq ft managed</p>
                <p className="text-xl font-black text-gold">2.3M+</p>
              </div>
              <div className="absolute -left-4 bottom-28 rounded-2xl border border-white/10 bg-navy/80 px-4 py-3 shadow-xl backdrop-blur-sm">
                <p className="text-xs text-white/40">Response time</p>
                <p className="text-xl font-black text-white">&lt; 2s</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div className="border-y border-white/10 bg-navy-mid">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {stats.map(s => (
              <div key={s.value} className="py-8 text-center">
                <div className="text-3xl font-black text-gold">{s.value}</div>
                <div className="mt-1 text-sm text-white/45">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Demo ─────────────────────────────────────────── */}
      <section id="demo" className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">See it in action</span>
            <h2 className="mt-4 text-4xl font-extrabold">Real questions. Real Devtraco documents.</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/45">
              Click any tab below to see how the system answers real questions across your contracts, site reports, and invoices.
            </p>
          </div>
          <DemoChat />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 bg-navy-mid md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Why Devtraco chose NyansapoAI
            </span>
            <h2 className="mt-4 text-4xl font-extrabold">
              Intelligence built for real estate
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/45">
              From site reports to board briefings — your documents become a searchable, answerable knowledge base your whole team can rely on.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(f => (
              <div key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-200 hover:border-gold/30 hover:bg-white/8 hover:shadow-xl hover:shadow-gold/5">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                  <f.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-3 text-lg font-bold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/45">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Queries ──────────────────────────────────── */}
      <section className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">What can you ask?</span>
          <h2 className="mt-4 text-4xl font-extrabold">Your team already has these questions</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/45">
            Any question you would normally spend hours chasing down — answered in under 2 seconds, with the source document cited.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {exampleQueries.map(q => (
              <Link key={q} href="/auth/login"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition hover:border-gold/30 hover:bg-gold/8 hover:text-white">
                {q}
              </Link>
            ))}
          </div>
          <Link href="/auth/login"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-6 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-navy">
            Start asking your own questions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 bg-navy-mid md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Simple by design</span>
            <h2 className="mt-4 text-4xl font-extrabold">From upload to insight in 3 steps</h2>
          </div>

          <div className="space-y-6">
            {steps.map(s => (
              <div key={s.n}
                className="flex gap-6 rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:border-gold/20">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10">
                  <span className="text-base font-black text-gold">{s.n}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-white/45">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Security ─────────────────────────────────── */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Enterprise ready</span>
          <h2 className="mt-4 text-3xl font-extrabold">Security you can trust</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {trusted.map(t => (
              <div key={t} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-gold/70" />{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-navy-mid md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Common questions</span>
            <h2 className="mt-4 text-4xl font-extrabold">Everything you need to know</h2>
            <p className="mx-auto mt-4 max-w-md text-white/45">
              Still have questions? Reach out via the <Link href="/contact" className="text-gold hover:underline">contact page</Link>.
            </p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-brand/10 p-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Your workspace is ready</p>
            <h2 className="text-4xl font-extrabold leading-tight">
              Stop searching.<br />Start knowing.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/50">
              Every Devtraco document. Every answer. Every source citation. Waiting for you right now.
            </p>
            <Link href="/auth/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-4 text-base font-bold text-navy shadow-xl shadow-gold/25 transition hover:bg-yellow-400">
              Sign in to Workspace <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-5 text-xs text-white/25">
              No setup. No training. Ask your first question in under 2 minutes.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
