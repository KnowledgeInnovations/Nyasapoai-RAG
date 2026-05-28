import type { Metadata } from 'next'
import { BarChart3, TrendingUp, AlertTriangle, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Insights — Devtraco Plus' }

const widgets = [
  { icon: AlertTriangle, label: 'Active risks', value: '—', color: 'text-amber-600 bg-amber-50' },
  { icon: TrendingUp, label: 'Trends detected', value: '—', color: 'text-green-600 bg-green-50' },
  { icon: FileText, label: 'Documents indexed', value: '—', color: 'text-brand bg-brand-light' },
  { icon: BarChart3, label: 'Queries this week', value: '—', color: 'text-gold bg-gold-light' },
]

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Insights</h1>
        <p className="mt-1 text-sm text-gray-500">
          Devtraco Plus organisation-wide trends, risks, and executive summaries.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((w) => (
          <div key={w.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-xl p-2 ${w.color}`}>
              <w.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{w.value}</p>
            <p className="mt-1 text-sm text-gray-500">{w.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">
          Upload Devtraco Plus documents to start seeing insights
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Reports, board minutes, contracts, and project files all work
        </p>
      </div>
    </div>
  )
}
