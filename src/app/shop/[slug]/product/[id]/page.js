'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ProductDetail() {
  const { slug, id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [accent, setAccent] = useState('#A6472F')
  const [activeImage, setActiveImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      const supabase = createClient()

      const { data: shop } = await supabase
        .from('shops')
        .select('theme_color')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (shop && shop.theme_color) {
        setAccent(shop.theme_color)
      }

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
      const images = data.image_urls && data.image_urls.length > 0
        ? data.image_urls
        : data.image_url
        ? [data.image_url]
        : []
      setActiveImage(images[0] || null)
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
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : product.image_url
    ? [product.image_url]
    : []

  const outOfStock = product.stock_quantity <= 0

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
        className="border-b border-[#E3D2B4] px-6 py-4 flex items-center justify-between"
      >
        <a href={`/shop/${slug}`} className="text-sm text-[#8A7C63] hover:text-[var(--accent)]">
          Back to shop
        </a>
        <a href={`/shop/${slug}/cart`} className="text-sm font-medium text-[var(--accent)] hover:underline">
          View cart
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-2xl border border-[#E3D2B4]"
              />
            ) : (
              <div className="w-full aspect-square bg-[#E3D2B4] rounded-2xl flex items-center justify-center text-[#8A7C63]">
                No image
              </div>
            )}

            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      activeImage === img ? 'border-[var(--accent)]' : 'border-[#E3D2B4]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#241F1C] mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold mb-4" style={{ color: accent }}>
              Tk {product.price}
            </p>

            {product.description && (
              <p className="text-[#6B6055] mb-6">{product.description}</p>
            )}

            {product.category && (
              <p className="text-xs text-[#8A7C63] mb-4">Category: {product.category}</p>
            )}

            <p className="text-xs text-[#8A7C63] mb-6">
              {outOfStock ? (
                <span className="text-red-600 font-medium">Out of stock</span>
              ) : (
                `${product.stock_quantity} in stock`
              )}
            </p>

            {!outOfStock && (
              <div className="flex items-center gap-3 mb-6">
                <label className="text-sm text-[#5B5347]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1))
                    setQuantity(val)
                  }}
                  className="w-16 bg-transparent border-b-2 border-[#DDCBAE] focus:border-[var(--accent)] outline-none py-1 text-center text-[#241F1C]"
                />
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              style={{ backgroundColor: outOfStock ? '#DDCBAE' : accent }}
              className="w-full text-[#FBF6EC] font-medium py-3 rounded-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}