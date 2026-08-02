'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

      setProducts(data || [])
      setLoading(false)
    }

    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <a
          href="/dashboard"
          className="inline-block text-sm text-[#8A7C63] hover:text-[#A6472F] mb-4"
        >
          Back to dashboard
        </a>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
              BazarHQ - Products
            </p>
            <h1 className="text-[26px] font-semibold text-[#241F1C]">Your products</h1>
          </div>
          <a
            href="/dashboard/products/new"
            className="bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            + Add product
          </a>
        </div>

        {loading ? (
          <p className="text-[#8A7C63]">Loading…</p>
        ) : products.length === 0 ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055]">No products yet. Add your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] overflow-hidden"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-[#E3D2B4] flex items-center justify-center text-[#8A7C63] text-sm">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-[#241F1C]">{product.name}</h3>
                  <p className="text-sm text-[#6B6055]">৳{product.price}</p>
                  <p className="text-xs text-[#8A7C63] mt-1">Stock: {product.stock_quantity}</p>
                  <a
                    href={`/dashboard/products/${product.id}/edit`}
                    className="inline-block mt-2 text-xs font-medium text-[#A6472F] hover:underline"
                  >
                    Edit
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}