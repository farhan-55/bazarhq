'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      setLoading(false)
      setError('Invalid email or password.')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    setLoading(false)

    if (profileError || !profile || profile.role !== 'super_admin') {
      await supabase.auth.signOut()
      setError('This account does not have Super Admin access.')
      return
    }

    router.push('/superadmin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1917] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#241F1C] rounded-2xl shadow-xl border border-[#3A332C] px-8 py-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium mb-3">
            BazarHQ - Super Admin
          </p>
          <h1 className="text-[26px] font-semibold text-[#FBF6EC] mb-1">
            Platform login
          </h1>
          <p className="text-sm text-[#8A7C63] mb-7">
            Restricted access. Authorized personnel only.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#B8AA90] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#3A332C] focus:border-[#A6472F] outline-none py-2 text-[#FBF6EC]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8AA90] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-b-2 border-[#3A332C] focus:border-[#A6472F] outline-none py-2 pr-12 text-[#FBF6EC]"
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
              <p className="text-sm text-[#F5A9A9] bg-[#A6472F]/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium tracking-wide py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}