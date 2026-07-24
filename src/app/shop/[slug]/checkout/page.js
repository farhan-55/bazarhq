'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Checkout() {
  const { slug } = useParams()
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const cartKey = `cart_${slug}`

  useEffect(() => {
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
    if (existingCart.length === 0) {
      router.push(`/shop/${slug}`)
      return
    }
    setCart(existingCart)
    setLoaded(true)
  }, [cartKey, slug, router])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (shopError || !shop) {
      setError('Shop not found.')
      setSubmitting(false)
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id: shop.id,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        total_amount: total,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      setError('Could not place order. Please try again.')
      setSubmitting(false)
      return
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    setSubmitting(false)

    if (itemsError) {
      setError('Order created but items could not be saved.')
      return
    }

    localStorage.removeItem(cartKey)
    setOrderPlaced(true)
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0] px-4">
        <div className="bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-10 max-w-sm text-center">
          <p className="text-3xl mb-3">Order placed</p>
          <p className="text-[#6B6055] mb-6">
            Thank you, {name}. Your order has been received and will be delivered soon.
          </p>
          <a
            href={`/shop/${slug}`}
            className="inline-block bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Back to shop
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4">
        <a href={`/shop/${slug}/cart`} className="text-sm text-[#8A7C63] hover:text-[#A6472F]">
          Back to cart
        </a>
      </div>

      <div className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-[#241F1C] mb-6">Checkout</h1>

        <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[#6B6055]">Order total</span>
            <span className="text-xl font-semibold text-[#A6472F]">Tk {total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-[#8A7C63] mt-2">Payment: Cash on Delivery</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5B5347] mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5B5347] mb-1.5">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5B5347] mb-1.5">Delivery address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C] resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>
      </div>
    </div>
  )
}