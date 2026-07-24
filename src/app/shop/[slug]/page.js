import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ShopStorefront({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  // Published shop khuje ber kora
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (shopError || !shop) {
    notFound()
  }

  // Shop er active products fetch kora
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      {/* Shop header */}
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-[#241F1C]">{shop.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!products || products.length === 0 ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055]">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${slug}/product/${product.id}`}
                className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] overflow-hidden hover:border-[#A6472F] transition-colors"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-[#E3D2B4] flex items-center justify-center text-[#8A7C63] text-sm">
                    No image
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium text-[#241F1C] text-sm">{product.name}</h3>
                  <p className="text-sm text-[#A6472F] font-semibold">৳{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}