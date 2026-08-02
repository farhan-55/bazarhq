'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fraunces, Inter } from 'next/font/google'
import { createClient } from '@/utils/supabase/client'

const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div
      className={`${inter.className} min-h-screen flex items-center justify-center px-4`}
      style={{
        background:
          'radial-gradient(circle at 20% 10%, #F7EFE0 0%, #F0E4D0 55%, #EADFC7 100%)',
      }}
    >
      <div className="w-full max-w-sm">
        <div
          className="h-4 rounded-t-2xl"
          style={{
            background:
              'repeating-linear-gradient(45deg, #A6472F, #A6472F 12px, #F0E4D0 12px, #F0E4D0 24px)',
          }}
        />

        <div className="bg-[#FBF6EC] rounded-b-2xl shadow-xl px-8 pt-7 pb-8 border border-[#E3D2B4] border-t-0">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium mb-3">
            BazarHQ · Merchant
          </p>

          <h1 className={`${fraunces.className} text-[32px] leading-tight text-[#241F1C] mb-1`}>
            Welcome back
          </h1>
          <p className="text-sm text-[#6B6055] mb-7">
            Log in to manage your shop.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C] placeholder:text-[#B8AA90] transition-colors"
              />
            </div>

            <div>
  <label className="block text-xs font-medium text-[#5B5347] mb-1.5">Password</label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 pr-8 text-[#241F1C] placeholder:text-[#B8AA90] transition-colors"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8A7C63] hover:text-[#A6472F] text-xs font-medium"
    >
      {showPassword ? 'Hide' : 'Show'}
    </button>
  </div>
</div>

            {error && (
              <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium tracking-wide py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-xs text-[#8A7C63] text-center mt-6">
            Don&apos;t have a shop yet?{' '}
            <a href="/signup" className="text-[#A6472F] font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}