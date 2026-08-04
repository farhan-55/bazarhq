'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0] px-4">
      <div className="w-full max-w-sm bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium mb-3">
          BazarHQ - Reset Password
        </p>
        <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">
          Set a new password
        </h1>

        {success ? (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            Password updated. Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 pr-12 text-[#241F1C]"
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
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}