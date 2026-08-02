'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function CreateShop() {
  const [shopName, setShopName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleNameChange = (value) => {
    setShopName(value)
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setSlug(generatedSlug)
  }

  const handleCreateShop = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('You must be logged in to create a shop.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('shops')
      .insert({
        owner_id: user.id,
        name: shopName,
        slug: slug,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        setError('This shop URL is already taken. Try a different name.')
      } else {
        setError(error.message)
      }
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0] px-4">
      <div className="w-full max-w-sm bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium mb-3">
          BazarHQ · Setup
        </p>
        <h1 className="text-[28px] leading-tight text-[#241F1C] mb-1 font-semibold">
          Name your shop
        </h1>
        <p className="text-sm text-[#6B6055] mb-6">
          This becomes your shop&apos;s web address.
        </p>

        <form onSubmit={handleCreateShop} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
              Shop name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Rahim's Leather"
              className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C] placeholder:text-[#B8AA90] transition-colors"
            />
          </div>

          {slug && (
            <p className="text-xs text-[#8A7C63]">
              Your shop URL:{' '}
              <span className="font-medium text-[#A6472F]">
                /shop/{slug}
              </span>
            </p>
          )}

          {error && (
            <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !slug}
            className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium tracking-wide py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Creating shop…' : 'Create shop'}
          </button>
        </form>
      </div>
    </div>
  )
}