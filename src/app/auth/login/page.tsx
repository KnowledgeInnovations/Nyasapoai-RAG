'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

const DEMO_EMAIL = 'demo@devtraco.com'
const DEMO_PASSWORD = 'Demo1234'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenant = searchParams.get('tenant')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Demo mode — no Supabase needed
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      document.cookie = 'demo_session=active; path=/; max-age=86400'
      router.push('/ask')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/ask')
    setLoading(false)
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/ask` },
    })
    if (error) setError(error.message)
    else setMagicSent(true)
    setLoading(false)
  }

  const isDevtraco = tenant === 'devtraco' || !tenant

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <span className="text-sm font-bold text-white">DT</span>
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-gray-900">Devtraco Plus</p>
            <p className="text-xs text-gray-400">Intelligence workspace</p>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isDevtraco ? 'Sign in to your workspace' : `Sign in to ${tenant}`}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Use your Devtraco Plus work email to continue.
        </p>
      </div>

      {/* Demo hint */}
      <div className="mt-6 rounded-xl border border-gold bg-gold-light px-4 py-3 text-sm">
        <p className="font-semibold text-gold-dark">Demo account</p>
        <p className="text-gray-600 mt-0.5">
          Email: <span className="font-mono font-medium">{DEMO_EMAIL}</span><br />
          Password: <span className="font-mono font-medium">{DEMO_PASSWORD}</span>
        </p>
      </div>

      {magicSent ? (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">Check your email</p>
          <p className="mt-1 text-sm text-green-600">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@devtraco.com"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button type="button" onClick={handleMagicLink} className="text-xs text-brand hover:underline">
                Email me a link instead
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[11px] text-gray-400">
        Powered by <span className="font-medium text-gray-500">NyansapoAI</span>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
