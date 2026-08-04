'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [noShop, setNoShop] = useState(false)
  const [dailyData, setDailyData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    const loadAnalytics = async () => {
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
        .select('id, total_amount, created_at')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: true })

      const orderList = orders || []
      setTotalOrders(orderList.length)
      setTotalRevenue(
        orderList.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      )

      const dayMap = {}
      const today = new Date()
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dayMap[key] = { date: key.slice(5), orders: 0, revenue: 0 }
      }

      orderList.forEach((order) => {
        const key = order.created_at.slice(0, 10)
        if (dayMap[key]) {
          dayMap[key].orders += 1
          dayMap[key].revenue += parseFloat(order.total_amount || 0)
        }
      })

      setDailyData(Object.values(dayMap))

      const orderIds = orderList.map((o) => o.id)
      let productTotals = {}

      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_name, quantity')
          .in('order_id', orderIds)

        ;(items || []).forEach((item) => {
          productTotals[item.product_name] =
            (productTotals[item.product_name] || 0) + item.quantity
        })
      }

      const sortedProducts = Object.entries(productTotals)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)

      setTopProducts(sortedProducts)
      setLoading(false)
    }

    loadAnalytics()
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

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
          BazarHQ - Analytics
        </p>
        <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">Analytics</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-5 py-4">
            <p className="text-xs text-[#8A7C63] mb-1">Total orders</p>
            <p className="text-2xl font-semibold text-[#241F1C]">{totalOrders}</p>
          </div>
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-5 py-4">
            <p className="text-xs text-[#8A7C63] mb-1">Total revenue</p>
            <p className="text-2xl font-semibold text-[#241F1C]">
              Tk {totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 mb-6">
          <h2 className="font-semibold text-[#241F1C] mb-4">Orders (last 14 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3D2B4" />
              <XAxis dataKey="date" stroke="#8A7C63" fontSize={12} />
              <YAxis stroke="#8A7C63" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBF6EC',
                  border: '1px solid #E3D2B4',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="#A6472F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 mb-6">
          <h2 className="font-semibold text-[#241F1C] mb-4">Revenue trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3D2B4" />
              <XAxis dataKey="date" stroke="#8A7C63" fontSize={12} />
              <YAxis stroke="#8A7C63" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBF6EC',
                  border: '1px solid #E3D2B4',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#A6472F"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5">
          <h2 className="font-semibold text-[#241F1C] mb-4">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[#8A7C63]">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E3D2B4" />
                <XAxis type="number" stroke="#8A7C63" fontSize={12} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8A7C63"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FBF6EC',
                    border: '1px solid #E3D2B4',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="qty" fill="#A6472F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}