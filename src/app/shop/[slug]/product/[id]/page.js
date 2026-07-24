'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ProductDetail() {
  const { slug, id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        router.push(`/shop/${slug}`)
        return
      }

      setProduct(data)
      setLoading(false)
    }

    loadProduct()
  }, [id, slug, router])

  const handleAddToCart = () => {
    const cartKey = `cart_${slug}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]')

    const existingItemIndex = existingCart.findIndex((item) => item.id === product.id)

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity,
      })
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4">
        <a href={`/shop/${slug}`} className="text-sm text-[#8A7C63] hover:text-[#A6472F]">
          ← Back to shop
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-2xl border border-[#E3D2B4] object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-[#E3D2B4] rounded-2xl flex items-center justify-center text-[#8A7C63]">
              No image
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold text-[#241F1C] mb-2">{product.name}</h1>
            <p className="text-2xl text-[#A6472F] font-semibold mb-4">৳{product.price}</p>

            {product.description && (
              <p className="text-[#6B6055] mb-6">{product.description}</p>
            )}

            {product.category && (
              <p className="text-xs text-[#8A7C63] mb-6">Category: {product.category}</p>
            )}

            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm text-[#5B5347]">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-1 text-center text-[#241F1C]"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium py-3 rounded-lg transition-colors"
            >
              {added ? '✓ Added to cart' : 'Add to cart'}
            </button>

            <a
              href={`/shop/${slug}/cart`}
              className="block text-center text-sm text-[#8A7C63] hover:text-[#A6472F] mt-4"
            >
              View cart →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}