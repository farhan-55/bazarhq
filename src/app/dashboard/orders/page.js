'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
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
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    loadOrders()
  }, [])

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null)
      return
    }

    setExpandedId(orderId)

    if (!orderItems[orderId]) {
      const supabase = createClient()
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }))
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    }
  }

  const statusColors = {
    pending: 'bg-[#E3D2B4] text-[#5B5347]',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
          BazarHQ - Orders
        </p>
        <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">Incoming orders</h1>

        {loading ? (
          <p className="text-[#8A7C63]">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055]">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#241F1C]">{order.customer_name}</p>
                    <p className="text-sm text-[#6B6055]">{order.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#A6472F]">
                      Tk {order.total_amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#6B6055] mt-2">{order.delivery_address}</p>

                <div className="flex items-center gap-3 mt-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-sm border border-[#DDCBAE] rounded-lg px-3 py-1.5 bg-transparent text-[#241F1C]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="text-sm text-[#8A7C63] hover:text-[#A6472F]"
                  >
                    {expandedId === order.id ? 'Hide items' : 'View items'}
                  </button>
                </div>

                {expandedId === order.id && (
                  <div className="mt-4 pt-4 border-t border-[#E3D2B4] space-y-2">
                    {(orderItems[order.id] || []).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[#241F1C]">
                          {item.product_name} x {item.quantity}
                        </span>
                        <span className="text-[#6B6055]">Tk {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}