'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [noShop, setNoShop] = useState(false)
  const [orderNotifs, setOrderNotifs] = useState([])
  const [stockNotifs, setStockNotifs] = useState([])

  useEffect(() => {
    const loadNotifications = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!shop) {
        setNoShop(true)
        setLoading(false)
        return
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, created_at')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setOrderNotifs(orders || [])

      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('shop_id', shop.id)
        .eq('status', 'active')
        .lte('stock_quantity', 5)
        .order('stock_quantity', { ascending: true })

      setStockNotifs(products || [])
      setLoading(false)
    }

    loadNotifications()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  if (noShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0] px-4">
        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-8 text-center">
          <p className="text-[#6B6055]">No shop found. Please create one first.</p>
        </div>
      </div>
    )
  }

  const hasAnyNotifs =
    orderNotifs.length > 0 || stockNotifs.length > 0

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
          BazarHQ - Notifications
        </p>

        <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">
          Notifications
        </h1>

        {!hasAnyNotifs ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stockNotifs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#8A7C63] uppercase tracking-wide mb-3">
                  Stock alerts
                </h2>

                <div className="space-y-2">
                  {stockNotifs.map((product) => (
                    <div
                      key={product.id}
                      className="bg-red-50 rounded-xl border border-red-200 px-4 py-3 flex items-center justify-between"
                    >
                      <p className="text-sm text-[#241F1C]">
                        {product.stock_quantity === 0 ? (
                          <>
                            <span className="font-medium">
                              {product.name}
                            </span>{' '}
                            is out of stock
                          </>
                        ) : (
                          <>
                            <span className="font-medium">
                              {product.name}
                            </span>{' '}
                            is running low - only {product.stock_quantity} left
                          </>
                        )}
                      </p>

                      <a
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-xs font-medium text-[#A6472F] hover:underline whitespace-nowrap ml-3"
                      >
                        Update stock
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orderNotifs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#8A7C63] uppercase tracking-wide mb-3">
                  Recent orders
                </h2>

                <div className="space-y-2">
                  {orderNotifs.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FBF6EC] rounded-xl border border-[#E3D2B4] px-4 py-3 flex items-center justify-between"
                    >
                      <p className="text-sm text-[#241F1C]">
                        New order from{' '}
                        <span className="font-medium">
                          {order.customer_name}
                        </span>{' '}
                        - Tk {order.total_amount}
                      </p>

                      <span className="text-xs text-[#8A7C63] whitespace-nowrap ml-3">
                        {timeAgo(order.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}