export const PRESETS = [
  {
    id: "warm-market",
    name: "Heritage",
    description: "Warm terracotta and cream, artisan market feel.",
    palette: { accent: "#A6472F", background: "#FDF9F0", surface: "#FBF6EC", border: "#E3D2B4", text: "#241F1C", muted: "#8A7C63" },
    font: "system",
  },
  {
    id: "minimal-mono",
    name: "Minimal Mono",
    description: "Black, white, one accent. Clean and spacious.",
    palette: { accent: "#3B4C6B", background: "#FFFFFF", surface: "#F7F7F7", border: "#E5E5E5", text: "#111111", muted: "#6B6B6B" },
    font: "system",
  },
  {
    id: "boutique",
    name: "Boutique",
    description: "Soft pastels, rounded, editorial.",
    palette: { accent: "#B0708A", background: "#FDF6F8", surface: "#FFFFFF", border: "#F0DDE3", text: "#2E2226", muted: "#8C7278" },
    font: "system",
  },
  {
    id: "market-bold",
    name: "Market Bold",
    description: "High contrast, bright accent, dense grid.",
    palette: { accent: "#E0472C", background: "#111111", surface: "#1B1B1B", border: "#333333", text: "#FAFAFA", muted: "#A0A0A0" },
    font: "system",
  },
]

export const BLOCK_CATALOG = [
  { type: "navbar", label: "Navbar (logo, search, cart)", defaultProps: { showSearch: true } },
  { type: "hero", label: "Hero image", defaultProps: {} },
  { type: "category-strip", label: "Category pills", defaultProps: {} },
  { type: "promo-banner", label: "Promo banner", defaultProps: { heading: "Special offer", subheading: "Check out what's new" } },
  { type: "product-grid", label: "Product grid", defaultProps: { columns: 4 } },
  { type: "footer", label: "Footer", defaultProps: {} },
]

function makeBlocks(types) {
  return types.map((type, i) => {
    const entry = BLOCK_CATALOG.find((b) => b.type === type)
    return {
      id: `${type}-${i}`,
      type,
      order: i,
      enabled: true,
      props: entry ? { ...entry.defaultProps } : {},
    }
  })
}

export const LAYOUT_PRESETS = [
  {
    id: "classic",
    name: "Classic Storefront",
    description: "Navbar, hero banner, categories, then products.",
    blocks: makeBlocks(["navbar", "hero", "category-strip", "product-grid", "footer"]),
  },
  {
    id: "minimal-grid",
    name: "Minimal Grid",
    description: "Straight to the products, no hero.",
    blocks: makeBlocks(["navbar", "product-grid", "footer"]),
  },
  {
    id: "boutique-showcase",
    name: "Boutique Showcase",
    description: "Hero, a promo banner, then products.",
    blocks: makeBlocks(["navbar", "hero", "promo-banner", "product-grid", "footer"]),
  },
  {
    id: "category-first",
    name: "Category First",
    description: "Categories up top before the hero.",
    blocks: makeBlocks(["navbar", "category-strip", "hero", "product-grid", "footer"]),
  },
]

export function getDefaultLayout() {
  return { layoutPreset: "classic", blocks: LAYOUT_PRESETS[0].blocks }
}

export function buildThemeConfig(preset) {
  return {
    preset: preset.id,
    palette: preset.palette,
    font: preset.font,
    layout: getDefaultLayout(),
  }
}
