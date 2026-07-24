'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadShop = async () => {
      const supabase = createClient()

      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (error) {
        setError('No shop found. Please create one first.')
        setLoading(false)
        return
      }

      setShop(data)
      setLoading(false)
    }

    loadShop()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleTogglePublish = async () => {
    if (!shop) return

    setPublishing(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('shops')
      .update({ is_published: !shop.is_published })
      .eq('id', shop.id)

    if (error) {
      setError('Unable to update publication status.')
    } else {
      setShop({ ...shop, is_published: !shop.is_published })
    }

    setPublishing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <div className="bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8 max-w-sm text-center">
          <p className="text-[#A6472F] mb-4">{error}</p>
          <a
            href="/create-shop"
            className="inline-block bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Create shop
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      {/* Top bar */}
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
            BazarHQ · Dashboard
          </p>
          <h1 className="text-lg font-semibold text-[#241F1C]">{shop.name}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#8A7C63] hover:text-[#A6472F] transition-colors"
        >
          Log out
        </button>
      </div>

      {/* Shop status card */}
<div className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-5 mb-6 flex items-center justify-between">
  <div>
    <p className="text-sm text-[#6B6055]">
      {shop.slug}.bazarhq.com
    </p>
    <p className="text-xs mt-1">
      <span
        className={`px-2 py-0.5 rounded-full font-medium ${
          shop.is_published
            ? 'bg-green-100 text-green-700'
            : 'bg-[#E3D2B4] text-[#8A7C63]'
        }`}
      >
        {shop.is_published ? 'Published' : 'Not published yet'}
      </span>
    </p>
  </div>
  <button
    onClick={handleTogglePublish}
    disabled={publishing}
    className={`px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
      shop.is_published
        ? 'bg-[#E3D2B4] text-[#5B5347] hover:bg-[#DDCBAE]'
        : 'bg-[#A6472F] text-[#FBF6EC] hover:bg-[#7C331F]'
    }`}
  >
    {publishing ? 'Updating…' : shop.is_published ? 'Unpublish' : 'Publish shop'}
  </button>
</div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/dashboard/products"
            className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-6 hover:border-[#A6472F] transition-colors"
          >
            <h2 className="font-semibold text-[#241F1C] mb-1">Products</h2>
            <p className="text-sm text-[#6B6055]">Add, edit, or remove items in your shop.</p>
          </a>

          <a
            href="/dashboard/orders"
            className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-6 hover:border-[#A6472F] transition-colors"
          >
            <h2 className="font-semibold text-[#241F1C] mb-1">Orders</h2>
            <p className="text-sm text-[#6B6055]">View and update incoming orders.</p>
          </a>
        </div>
      </div>
  )
}