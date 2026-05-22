import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Pricing' }

const plans = [
  {
    name: 'Starter',
    price: '$499',
    period: '/month',
    description: 'For small teams getting started with document intelligence.',
    features: [
      'Up to 5 users',
      '500 documents',
      'RAG Q&A with citations',
      'PDF, DOCX, CSV support',
      'Email support',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$1,499',
    period: '/month',
    description: 'For growing organisations needing deeper insights.',
    features: [
      'Up to 50 users',
      'Unlimited documents',
      'Role-based access control',
      'Risk & trend detection',
      'Executive dashboards',
      'Priority support',
    ],
    cta: 'Book a demo',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organisations with compliance requirements.',
    features: [
      'Unlimited users',
      'Unlimited documents',
      'Audit logs & governance',
      'Custom integrations',
      'SSO / SAML',
      'Dedicated success manager',
      'SLA guarantee',
    ],
    cta: 'Contact us',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-gray-500">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-8 ${
              plan.highlight
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl'
                : 'border-gray-200 bg-white'
            }`}
          >
            <h2
              className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
            >
              {plan.name}
            </h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span
                className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}
              >
                {plan.price}
              </span>
              <span
                className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}
              >
                {plan.period}
              </span>
            </div>
            <p
              className={`mt-3 text-sm ${plan.highlight ? 'text-indigo-100' : 'text-gray-500'}`}
            >
              {plan.description}
            </p>

            <ul className="mt-8 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-indigo-500'}`}
                  />
                  <span className={plan.highlight ? 'text-indigo-50' : 'text-gray-700'}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/demo"
              className={`mt-8 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                plan.highlight
                  ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
