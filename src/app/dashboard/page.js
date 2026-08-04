'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Overview() {
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishing, setPublishing] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadShop = async () => {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

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

  const handleTogglePublish = async () => {
    if (!shop) return

    setPublishing(true)

    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .update({
        is_published: !shop.is_published,
      })
      .eq('id', shop.id)
      .select()
      .single()

    setPublishing(false)

    if (!error) {
      setShop(data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <div className="bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8 max-w-sm text-center">
          <p className="text-[#A6472F] mb-4">{error}</p>

          <Link
            href="/create-shop"
            className="inline-block bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Create Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
          BazarHQ · Dashboard
        </p>

        <h1 className="text-[28px] font-semibold text-[#241F1C] mt-2 mb-6">
          {shop.name}
        </h1>

        <div className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A6472F] font-medium hover:underline"
            >
              /shop/{shop.slug}
            </a>

            <div className="mt-3">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  shop.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[#E3D2B4] text-[#6B6055]'
                }`}
              >
                {shop.is_published ? 'Published' : 'Not Published'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50 ${
              shop.is_published
                ? 'bg-[#E3D2B4] text-[#5B5347] hover:bg-[#DCC8A7]'
                : 'bg-[#A6472F] text-[#FBF6EC] hover:bg-[#7C331F]'
            }`}
          >
            {publishing
              ? 'Updating...'
              : shop.is_published
              ? 'Unpublish'
              : 'Publish Shop'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/dashboard/products"
            className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] shadow-md p-6 hover:border-[#A6472F] transition"
          >
            <h2 className="text-lg font-semibold text-[#241F1C] mb-2">
              📦 Products
            </h2>

            <p className="text-sm text-[#6B6055]">
              Add, edit and manage products in your store.
            </p>
          </Link>

          <Link
            href="/dashboard/orders"
            className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] shadow-md p-6 hover:border-[#A6472F] transition"
          >
            <h2 className="text-lg font-semibold text-[#241F1C] mb-2">
              🛒 Orders
            </h2>

            <p className="text-sm text-[#6B6055]">
              View customer orders and update their status.
            </p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] shadow-md p-6 hover:border-[#A6472F] transition"
          >
            <h2 className="text-lg font-semibold text-[#241F1C] mb-2">
              📈 Analytics
            </h2>

            <p className="text-sm text-[#6B6055]">
              Monitor visitors, sales and shop performance.
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] shadow-md p-6 hover:border-[#A6472F] transition"
          >
            <h2 className="text-lg font-semibold text-[#241F1C] mb-2">
              ⚙️ Settings
            </h2>

            <p className="text-sm text-[#6B6055]">
              Update your shop information, banner and branding.
            </p>
          </Link>

          <Link
            href="/dashboard/theme-studio"
            className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] shadow-md p-6 hover:border-[#A6472F] transition sm:col-span-2"
          >
            <h2 className="text-lg font-semibold text-[#241F1C] mb-2">
              🎨 Theme Studio
            </h2>

            <p className="text-sm text-[#6B6055]">
              Customize your storefront colors, typography, buttons, sections,
              and overall brand identity.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}