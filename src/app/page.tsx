import Link from 'next/link'
import { FileText, MessageSquare, CheckCircle2, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react'
import MarketingNav from '@/components/marketing/Nav'
import MarketingFooter from '@/components/marketing/Footer'

const steps = [
  {
    icon: FileText,
    title: 'Connect your data',
    description:
      'Upload PDFs, Word docs, spreadsheets, or connect Google Drive and SharePoint. We handle the rest.',
  },
  {
    icon: MessageSquare,
    title: 'Ask questions',
    description:
      'Type any question in plain English. No SQL, no search operators — just ask like you would a colleague.',
  },
  {
    icon: CheckCircle2,
    title: 'Get cited answers',
    description:
      'Every answer references the exact documents it came from. Trace any claim back to its source instantly.',
  },
]

const useCases = [
  {
    title: 'Executive briefings',
    description: `"Summarise last quarter's performance across all regional reports" — a two-minute read instead of two hours.`,
    tag: 'Senior leadership',
  },
  {
    title: 'Risk detection',
    description:
      '"Which contracts are approaching renewal thresholds?" — flagged automatically before they become problems.',
    tag: 'Legal & compliance',
  },
  {
    title: 'Operations insights',
    description:
      '"Where are fulfilment delays concentrated?" — answered with evidence from ops reports and supplier emails.',
    tag: 'Operations',
  },
  {
    title: 'Customer intelligence',
    description:
      '"What complaints are rising in the East region?" — spotted across CRM notes, tickets, and surveys at once.',
    tag: 'Customer success',
  },
]

const mockMessages = [
  {
    role: 'user',
    text: 'What are the top 3 risks likely to affect our revenue next quarter?',
  },
  {
    role: 'ai',
    text: 'Based on your Q3 board report and regional sales data, the top risks are:\n\n1. Supplier delay in the Northern region — affecting ~18% of fulfilment\n2. FX exposure on two key contracts expiring in October\n3. Rising customer churn in the SME segment (+12% MoM)\n\nSources: [Q3 Board Report p.4]  [Sales Dashboard Oct]',
  },
]

export default function HomePage() {
  return (
    <>
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-light via-white to-white px-6 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-semibold text-gold-dark">
              Enterprise AI · Built for decisions
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
              Your documents.
              <br />
              <span className="text-brand">Your answers.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              NyansapoAI turns your internal documents into a private AI analyst —
              answering questions, detecting risks, and generating cited insights
              your team can actually act on.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/demo"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                See pricing <ArrowRight className="inline h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mock chat */}
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-xl">
            <div className="space-y-4">
              {mockMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      m.role === 'user' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {m.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div
                    className={`max-w-sm rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                      m.role === 'user' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              Answers grounded in your documents · Citations included
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-3 text-center text-gray-500">Three steps from upload to insight.</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="bg-gray-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-gray-900">Built for every team</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {useCases.map((uc, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <span className="inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">
                    {uc.tag}
                  </span>
                  <h3 className="mt-3 font-semibold text-gray-900">{uc.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-gray-100 px-6 py-12">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              { icon: ShieldCheck, text: 'SOC 2 ready architecture' },
              { icon: FileText, text: 'Every answer is cited' },
              { icon: BarChart3, text: 'Role-based access control' },
              { icon: ShieldCheck, text: 'Data never leaves your tenant' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-gold" />
                {item.text}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to put your documents to work?
            </h2>
            <p className="mt-4 text-gray-500">
              Book a 30-minute demo and see NyansapoAI answer questions from your own documents — live.
            </p>
            <Link
              href="/demo"
              className="mt-8 inline-block rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Book a free demo
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  )
}
