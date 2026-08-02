'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const THEME_COLORS = [
  { name: 'Terracotta', value: '#A6472F' },
  { name: 'Forest', value: '#4B6350' },
  { name: 'Indigo', value: '#3B4C6B' },
]

export default function Dashboard() {
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [savingTheme, setSavingTheme] = useState(false)
  const [pendingTheme, setPendingTheme] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const router = useRouter()
  const bannerInputRef = useRef(null)

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
    setPublishing(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .update({ is_published: !shop.is_published })
      .eq('id', shop.id)
      .select()
      .single()

    setPublishing(false)

    if (!error) {
      setShop(data)
    }
  }

  const handleBannerSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleBannerCancel = () => {
    setBannerFile(null)
    setBannerPreview(null)
  }

  const handleBannerConfirm = async () => {
    if (!bannerFile) return

    setUploadingBanner(true)
    const supabase = createClient()

    const fileExt = bannerFile.name.split('.').pop()
    const fileName = `banner-${shop.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, bannerFile)

    if (uploadError) {
      setUploadingBanner(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('shops')
      .update({ hero_image_url: publicUrlData.publicUrl })
      .eq('id', shop.id)
      .select()
      .single()

    setUploadingBanner(false)

    if (!error) {
      setShop(data)
      setBannerFile(null)
      setBannerPreview(null)
    }
  }

  const handleThemeConfirm = async () => {
    setSavingTheme(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .update({ theme_color: pendingTheme })
      .eq('id', shop.id)
      .select()
      .single()

    setSavingTheme(false)

    if (!error) {
      setShop(data)
      setPendingTheme(null)
    }
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
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
            BazarHQ - Dashboard
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

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-5 mb-6 flex items-center justify-between">
          <div>
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#A6472F] font-medium hover:underline"
            >
              /shop/{shop.slug}
            </a>
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
            {publishing ? 'Updating...' : shop.is_published ? 'Unpublish' : 'Publish shop'}
          </button>
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-5 mb-6">
          <h2 className="font-semibold text-[#241F1C] mb-1">Shop banner</h2>
          <p className="text-sm text-[#6B6055] mb-4">
            Shown at the top of your storefront page.
          </p>

          {bannerPreview ? (
            <div>
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleBannerConfirm}
                  disabled={uploadingBanner}
                  className="bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {uploadingBanner ? 'Saving...' : 'Confirm banner'}
                </button>
                <button
                  onClick={handleBannerCancel}
                  disabled={uploadingBanner}
                  className="bg-[#E3D2B4] hover:bg-[#DDCBAE] text-[#5B5347] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {shop.hero_image_url && (
                <img
                  src={shop.hero_image_url}
                  alt="Shop banner"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerSelect}
                className="hidden"
              />
              <button
                onClick={() => bannerInputRef.current.click()}
                className="bg-[#E3D2B4] hover:bg-[#DDCBAE] text-[#5B5347] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {shop.hero_image_url ? 'Change banner' : 'Upload banner'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl shadow-md border border-[#E3D2B4] px-6 py-5 mb-6">
          <h2 className="font-semibold text-[#241F1C] mb-1">Shop color</h2>
          <p className="text-sm text-[#6B6055] mb-4">
            Pick an accent color for your storefront.
          </p>

          <div className="flex gap-3 mb-4">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setPendingTheme(color.value)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  style={{ backgroundColor: color.value }}
                  className={`w-10 h-10 rounded-full border-2 ${
                    (pendingTheme || shop.theme_color) === color.value
                      ? 'border-[#241F1C]'
                      : 'border-transparent'
                  }`}
                />
                <span className="text-xs text-[#8A7C63]">{color.name}</span>
              </button>
            ))}
          </div>

          {pendingTheme && pendingTheme !== shop.theme_color && (
            <div className="flex gap-3">
              <button
                onClick={handleThemeConfirm}
                disabled={savingTheme}
                className="bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {savingTheme ? 'Saving...' : 'Confirm color'}
              </button>
              <button
                onClick={() => setPendingTheme(null)}
                disabled={savingTheme}
                className="bg-[#E3D2B4] hover:bg-[#DDCBAE] text-[#5B5347] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

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
    </div>
  )
}