'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Account() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setEmail(user.email)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Password updated successfully.')
    setNewPassword('')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-md mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
          BazarHQ - Account
        </p>
        <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">Account</h1>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 mb-6">
          <p className="text-xs text-[#8A7C63] mb-1">Email</p>
          <p className="text-sm font-medium text-[#241F1C]">{email}</p>
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 mb-6">
          <h2 className="font-semibold text-[#241F1C] mb-1">Change password</h2>
          <p className="text-sm text-[#6B6055] mb-4">
            Enter a new password for your account.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New password"
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 pr-12 text-[#241F1C] placeholder:text-[#B8AA90]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8A7C63] hover:text-[#A6472F] text-xs font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {message && (
              <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-[#8A7C63] hover:text-[#A6472F] transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}