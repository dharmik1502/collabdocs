'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_ACCOUNTS = [
  { email: 'alice@demo.com', name: 'Alice', initials: 'AL' },
  { email: 'bob@demo.com', name: 'Bob', initials: 'BO' },
  { email: 'carol@demo.com', name: 'Carol', initials: 'CA' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient gradient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-sky-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-b from-sky-400 to-blue-900 rounded-2xl mb-5 shadow-2xl shadow-sky-900/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CollabDocs</h1>
          <p className="mt-1.5 text-sm text-slate-400">Sign in to your workspace</p>
        </div>

        {/* Glass login card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-b from-sky-400 to-blue-800 hover:from-sky-300 hover:to-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-sky-900/40 hover:shadow-sky-800/60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick sign in</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(({ email: e, name, initials }) => (
              <button
                key={e}
                onClick={() => { setEmail(e); setPassword('demo1234') }}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-sky-700/50 transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-b from-sky-400 to-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md shadow-sky-900/40">
                  {initials}
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-sky-400 transition-colors">{name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4 text-center">
            Password: <span className="font-mono text-slate-400">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  )
}
