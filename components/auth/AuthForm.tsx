'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export default function AuthForm() {
  const router = useRouter()
  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.session) {
        // Auto-confirmed: session is active, go to dashboard (which redirects to onboarding)
        router.push('/dashboard')
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-6">
      {/* Logo */}
      <Image
        src="/logo/HanumanJiLogo.jpeg"
        alt="MyUpdates Logo"
        width={72}
        height={72}
        className="rounded-full object-cover"
        priority
      />

      {/* Title */}
      <h1 className="text-2xl font-semibold text-app-text tracking-tight">
        My <span className="text-brand-strong">Updates</span>
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border text-app-text placeholder-app-muted focus:outline-none focus:border-brand-mid text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border text-app-text placeholder-app-muted focus:outline-none focus:border-brand-mid text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-brand-strong text-white font-medium text-sm hover:bg-brand-mid transition-colors disabled:opacity-60"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-xs text-center">{success}</p>
        )}
      </form>

      {/* Toggle */}
      <p className="text-xs text-app-muted">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="text-brand-strong underline"
            >
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-brand-strong underline"
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  )
}
