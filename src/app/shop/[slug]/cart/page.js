'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Cart() {
  const { slug } = useParams()
  const [cart, setCart] = useState([])
  const [accent, setAccent] = useState('#A6472F')
  const [loaded, setLoaded] = useState(false)

  const cartKey = `cart_${slug}`

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const { data: shop } = await supabase
        .from('shops')
        .select('theme_color, theme_config')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      const accentColor = shop?.theme_config?.palette?.accent || shop?.theme_color
      if (accentColor) {
        setAccent(accentColor)
      }

      const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')
      setCart(existingCart)
      setLoaded(true)
    }

    load()
  }, [cartKey, slug])

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
  }

  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id)
    setCart(updatedCart)
    localStorage.setItem(cartKey, JSON.stringify(updatedCart))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        '--accent': accent,
        backgroundColor: `color-mix(in srgb, ${accent} 10%, #FDF9F0)`,
      }}
      className="min-h-screen"
    >
      <div style={{ backgroundColor: accent }} className="h-1.5 w-full" />

      <div
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, #FBF6EC)` }}
        className="border-b border-[#E3D2B4] px-6 py-4 flex items-center gap-4"
      >
        <a href={`/shop/${slug}`} className="text-sm text-[#8A7C63] hover:text-[var(--accent)]">
          Continue shopping
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-[#241F1C] mb-6">Your cart</h1>

        {cart.length === 0 ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055] mb-4">Your cart is empty.</p>
            <a
              href={`/shop/${slug}`}
              className="font-medium hover:underline"
              style={{ color: accent }}
            >
              Browse products
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-4 flex items-center gap-4"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#E3D2B4] rounded-lg flex items-center justify-center text-xs text-[#8A7C63]">
                      No image
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-medium text-[#241F1C]">{item.name}</h3>
                    <p className="text-sm font-medium" style={{ color: accent }}>
                      Tk {item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-[#E3D2B4] text-[#5B5347] hover:bg-[#DDCBAE]"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-[#241F1C]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#E3D2B4] text-[#5B5347] hover:bg-[#DDCBAE]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm hover:underline"
                    style={{ color: accent }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 flex items-center justify-between mb-4">
              <span className="font-medium text-[#241F1C]">Total</span>
              <span className="text-xl font-semibold" style={{ color: accent }}>
                Tk {total.toFixed(2)}
              </span>
            </div>

            <a
              href={`/shop/${slug}/checkout`}
              style={{ backgroundColor: accent }}
              className="block text-center w-full text-[#FBF6EC] font-medium py-3 rounded-lg transition-opacity hover:opacity-90"
            >
              Proceed to checkout
            </a>
          </>
        )}
      </div>
    </div>
  )
}