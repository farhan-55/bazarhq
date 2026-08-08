import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import ThemeProvider from "@/theme/ThemeProvider"
import { BLOCK_REGISTRY } from "@/theme/registry"
import { getDefaultLayout } from "@/theme/presets"

export default async function ShopStorefront({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (shopError || !shop) {
    notFound()
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const themeConfig = shop.theme_config || {}
  const palette = themeConfig.palette || {
    accent: shop.theme_color || "#A6472F",
  }

  const layout = themeConfig.layout || getDefaultLayout()

  const blocks = (layout.blocks || [])
    .filter((b) => b.enabled !== false)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      <a
        href="/"
        className="block bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-2 text-xs text-[#8A7C63] hover:text-[#241F1C] font-medium"
      >
        ← BazarHQ
      </a>

      <ThemeProvider palette={palette}>
        {blocks.map((block) => {
          const Block = BLOCK_REGISTRY[block.type]

          if (!Block) return null

          return (
            <Block
              key={block.id}
              shop={shop}
              products={products}
              slug={slug}
              props={block.props}
            />
          )
        })}
      </ThemeProvider>
    </>
  )
}
