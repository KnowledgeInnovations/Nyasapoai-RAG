import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Book a Demo' }

export default function DemoPage() {
  return (
    <div className="px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          See it with your own documents
        </h1>
        <p className="mt-4 text-gray-500">
          Book a 30-minute live demo. Bring a sample document — we'll show you
          what NyansapoAI can do with it on the call.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Work email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Organisation name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team size
            </label>
            <select className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <option>1–10</option>
              <option>11–50</option>
              <option>51–200</option>
              <option>200+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              What are you hoping to solve?
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="e.g. We have hundreds of internal reports and nobody reads them..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Request demo
          </button>
        </form>
      </div>
    </div>
  )
}
