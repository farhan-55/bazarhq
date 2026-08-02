"use client"

import ThemeProvider from "./ThemeProvider"
import { BLOCK_REGISTRY } from "./registry"

export default function StorefrontPreview({ shop, products, themeConfig }) {
  const palette = themeConfig?.palette || {}
  const font = themeConfig?.font || "system"
  const blocks = (themeConfig?.layout?.blocks || [])
    .filter((b) => b.enabled !== false)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="rounded-2xl border border-[#E3D2B4] overflow-hidden shadow-inner">
      <div className="max-h-[70vh] overflow-y-auto">
        <ThemeProvider palette={palette} font={font} fullHeight={false}>
          {blocks.map((block) => {
            const Block = BLOCK_REGISTRY[block.type]
            if (!Block) return null
            return (
              <Block
                key={block.id}
                shop={shop}
                products={products}
                slug={shop?.slug}
                props={block.props}
              />
            )
          })}
        </ThemeProvider>
      </div>
    </div>
  )
}
