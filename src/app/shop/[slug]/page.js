import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ShopStorefront({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (shopError || !shop) {
    notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const accent = shop.theme_color || '#A6472F'

  return (
    <div
      style={{
        '--accent': accent,
        backgroundColor: `color-mix(in srgb, ${accent} 10%, #FDF9F0)`,
      }}
      className="min-h-screen"
    >
      <div style={{ backgroundColor: accent }} className="h-1.5 w-full" />

      {shop.hero_image_url && (
        <div className="w-full aspect-[3/1] sm:aspect-[4/1] overflow-hidden">
          <img
            src={shop.hero_image_url}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 18%, #FBF6EC)` }}
        className="border-b border-[#E3D2B4] px-6 py-8"
      >
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
                className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] overflow-hidden hover:border-[var(--accent)] transition-colors"
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
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    Tk {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}