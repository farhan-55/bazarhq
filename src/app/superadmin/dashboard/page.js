'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [shops, setShops] = useState([])
  const [merchantCount, setMerchantCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [updatingId, setUpdatingId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/superadmin')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'super_admin') {
        await supabase.auth.signOut()
        router.push('/superadmin')
        return
      }

      const { data: shopsData } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('role', 'merchant')

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')

      const emailMap = {}
      ;(profilesData || []).forEach((p) => {
        emailMap[p.id] = p.email
      })

      const shopsWithEmail = (shopsData || []).map((shop) => ({
        ...shop,
        ownerEmail: emailMap[shop.owner_id] || 'Unknown',
      }))

      setShops(shopsWithEmail)
      setMerchantCount((profilesData || []).length)
      setOrderCount((ordersData || []).length)
      setTotalRevenue(
        (ordersData || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      )
      setLoading(false)
    }

    loadData()
  }, [router])

  const toggleShopStatus = async (shopId, currentStatus) => {
    setUpdatingId(shopId)
    const supabase = createClient()

    const { error } = await supabase
      .from('shops')
      .update({ is_published: !currentStatus })
      .eq('id', shopId)

    setUpdatingId(null)

    if (!error) {
      setShops((prev) =>
        prev.map((s) =>
          s.id === shopId ? { ...s, is_published: !currentStatus } : s
        )
      )
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/superadmin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1917]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1C1917]">
      <div className="bg-[#241F1C] border-b border-[#3A332C] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
            BazarHQ - Super Admin
          </p>
          <h1 className="text-lg font-semibold text-[#FBF6EC]">Platform overview</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#8A7C63] hover:text-[#A6472F] transition-colors"
        >
          Log out
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#241F1C] rounded-2xl border border-[#3A332C] px-5 py-4">
            <p className="text-xs text-[#8A7C63] mb-1">Total merchants</p>
            <p className="text-2xl font-semibold text-[#FBF6EC]">{merchantCount}</p>
          </div>
          <div className="bg-[#241F1C] rounded-2xl border border-[#3A332C] px-5 py-4">
            <p className="text-xs text-[#8A7C63] mb-1">Total shops</p>
            <p className="text-2xl font-semibold text-[#FBF6EC]">{shops.length}</p>
          </div>
          <div className="bg-[#241F1C] rounded-2xl border border-[#3A332C] px-5 py-4">
            <p className="text-xs text-[#8A7C63] mb-1">Total orders</p>
            <p className="text-2xl font-semibold text-[#FBF6EC]">{orderCount}</p>
          </div>
          <div className="bg-[#241F1C] rounded-2xl border border-[#3A332C] px-5 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-[#8A7C63] mb-1">Total revenue</p>
            <p className="text-2xl font-semibold text-[#FBF6EC]">
              Tk {totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#FBF6EC] mb-4">All shops</h2>

        {shops.length === 0 ? (
          <div className="bg-[#241F1C] rounded-2xl border border-[#3A332C] px-8 py-12 text-center">
            <p className="text-[#8A7C63]">No shops registered yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-[#241F1C] rounded-2xl border border-[#3A332C] p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-[#FBF6EC]">{shop.name}</p>
                  <p className="text-xs text-[#8A7C63]">/shop/{shop.slug}</p>
                  <p className="text-xs text-[#8A7C63] mt-1">{shop.ownerEmail}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      shop.is_published
                        ? 'bg-green-900 text-green-300'
                        : 'bg-[#3A332C] text-[#8A7C63]'
                    }`}
                  >
                    {shop.is_published ? 'Published' : 'Unpublished'}
                  </span>

                  <button
                    onClick={() => toggleShopStatus(shop.id, shop.is_published)}
                    disabled={updatingId === shop.id}
                    className="text-xs bg-[#3A332C] hover:bg-[#4A423A] disabled:opacity-50 text-[#FBF6EC] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {updatingId === shop.id
                      ? 'Updating...'
                      : shop.is_published
                      ? 'Suspend'
                      : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}