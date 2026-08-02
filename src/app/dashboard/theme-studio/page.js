"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { PRESETS, LAYOUT_PRESETS, BLOCK_CATALOG, buildThemeConfig } from "@/theme/presets"
import StorefrontPreview from "@/theme/StorefrontPreview"

const SECTIONS = ["Templates", "Colors", "Typography", "Layout", "Images"]

const FONT_OPTIONS = [
  { id: "system", label: "System sans-serif" },
  { id: "serif", label: "Classic serif" },
  { id: "mono", label: "Monospace" },
]

export default function ThemeStudio() {
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [themeConfig, setThemeConfig] = useState(null)
  const [activeSection, setActiveSection] = useState("Templates")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const router = useRouter()
  const heroInputRef = useRef(null)
  const logoInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (shopError || !shopData) {
        setError("No shop found. Please create one first.")
        setLoading(false)
        return
      }

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      setShop(shopData)
      setProducts(productData || [])
      setThemeConfig(shopData.theme_config || buildThemeConfig(PRESETS[0]))
      setLoading(false)
    }

    load()
  }, [router])

  const markDirty = () => setSaved(false)

  const applyColorPreset = (preset) => {
    setThemeConfig((prev) => ({
      ...prev,
      preset: preset.id,
      palette: preset.palette,
      font: preset.font,
    }))
    markDirty()
  }

  const updatePaletteColor = (key, value) => {
    setThemeConfig((prev) => ({
      ...prev,
      palette: { ...prev.palette, [key]: value },
    }))
    markDirty()
  }

  const updateFont = (fontId) => {
    setThemeConfig((prev) => ({ ...prev, font: fontId }))
    markDirty()
  }

  const applyLayoutPreset = (layoutPreset) => {
    setThemeConfig((prev) => ({
      ...prev,
      layout: {
        layoutPreset: layoutPreset.id,
        blocks: layoutPreset.blocks.map((b) => ({ ...b, props: { ...b.props } })),
      },
    }))
    markDirty()
  }

  const toggleBlock = (blockId) => {
    setThemeConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        blocks: prev.layout.blocks.map((b) =>
          b.id === blockId ? { ...b, enabled: b.enabled === false ? true : false } : b
        ),
      },
    }))
    markDirty()
  }

  const removeBlock = (blockId) => {
    setThemeConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        blocks: prev.layout.blocks.filter((b) => b.id !== blockId),
      },
    }))
    markDirty()
  }

  const addBlock = (catalogEntry) => {
    setThemeConfig((prev) => {
      const blocks = prev.layout?.blocks || []
      const maxOrder = blocks.reduce((max, b) => Math.max(max, b.order), -1)
      const newBlock = {
        id: `${catalogEntry.type}-${Date.now()}`,
        type: catalogEntry.type,
        order: maxOrder + 1,
        enabled: true,
        props: { ...catalogEntry.defaultProps },
      }
      return {
        ...prev,
        layout: { ...prev.layout, blocks: [...blocks, newBlock] },
      }
    })
    markDirty()
  }

  const setNavbarLogo = (url) => {
    setThemeConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        blocks: prev.layout.blocks.map((b) =>
          b.type === "navbar" ? { ...b, props: { ...b.props, logoUrl: url } } : b
        ),
      },
    }))
    markDirty()
  }

  const handleHeroSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingHero(true)
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `hero-${shop.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file)

    if (uploadError) {
      setUploadingHero(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName)

    setShop((prev) => ({ ...prev, hero_image_url: publicUrlData.publicUrl }))
    setUploadingHero(false)
    markDirty()
  }

  const handleLogoSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingLogo(true)
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `logo-${shop.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file)

    if (uploadError) {
      setUploadingLogo(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName)

    setNavbarLogo(publicUrlData.publicUrl)
    setUploadingLogo(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const { data, error: saveError } = await supabase
      .from("shops")
      .update({
        theme_config: themeConfig,
        hero_image_url: shop.hero_image_url,
      })
      .eq("id", shop.id)
      .select()
      .single()

    setSaving(false)

    if (!saveError) {
      setShop(data)
      setSaved(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <div className="bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8 max-w-sm text-center">
          <p className="text-[#A6472F] mb-4">{error}</p>
          <a
            href="/create-shop"
            className="inline-block bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Create shop
          </a>
        </div>
      </div>
    )
  }

  const currentBlocks = themeConfig.layout?.blocks || []
  const currentTypes = new Set(currentBlocks.map((b) => b.type))
  const availableToAdd = BLOCK_CATALOG.filter((b) => !currentTypes.has(b.type))
  const hasNavbar = currentTypes.has("navbar")

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4 flex items-center justify-between">
        <div>
          <a href="/dashboard" className="text-xs text-[#8A7C63] hover:text-[#A6472F]">
            Back to dashboard
          </a>
          <h1 className="text-lg font-semibold text-[#241F1C]">Theme Studio</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <div>
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-2 mb-4">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === section
                    ? "bg-[#A6472F] text-[#FBF6EC]"
                    : "text-[#5B5347] hover:bg-[#E3D2B4]/50"
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 max-h-[65vh] overflow-y-auto">
            {activeSection === "Templates" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Color templates</h3>
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyColorPreset(preset)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      themeConfig.preset === preset.id
                        ? "border-[#A6472F]"
                        : "border-[#E3D2B4] hover:border-[#8A7C63]"
                    }`}
                  >
                    <div className="flex gap-1.5 mb-2">
                      {Object.values(preset.palette)
                        .slice(0, 4)
                        .map((c, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                    </div>
                    <p className="text-sm font-medium text-[#241F1C]">{preset.name}</p>
                    <p className="text-xs text-[#8A7C63]">{preset.description}</p>
                  </button>
                ))}
              </div>
            )}

            {activeSection === "Colors" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Colors</h3>
                {Object.entries(themeConfig.palette || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-[#5B5347] capitalize">{key}</label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updatePaletteColor(key, e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer border border-[#E3D2B4]"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === "Typography" && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Typography</h3>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateFont(f.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                      themeConfig.font === f.id
                        ? "border-[#A6472F] bg-[#A6472F]/5"
                        : "border-[#E3D2B4] hover:border-[#8A7C63]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {activeSection === "Layout" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Choose a layout</h3>
                  <div className="space-y-2">
                    {LAYOUT_PRESETS.map((lp) => (
                      <button
                        key={lp.id}
                        onClick={() => applyLayoutPreset(lp)}
                        className={`w-full text-left rounded-xl border p-3 transition-colors ${
                          themeConfig.layout?.layoutPreset === lp.id
                            ? "border-[#A6472F]"
                            : "border-[#E3D2B4] hover:border-[#8A7C63]"
                        }`}
                      >
                        <p className="text-sm font-medium text-[#241F1C]">{lp.name}</p>
                        <p className="text-xs text-[#8A7C63]">{lp.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Sections in this layout</h3>
                  <div className="space-y-2">
                    {currentBlocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => {
                        const catalogEntry = BLOCK_CATALOG.find((c) => c.type === block.type)
                        return (
                          <div
                            key={block.id}
                            className="flex items-center justify-between border border-[#E3D2B4] rounded-xl px-3 py-2.5"
                          >
                            <label className="flex items-center gap-2 text-sm text-[#241F1C]">
                              <input
                                type="checkbox"
                                checked={block.enabled !== false}
                                onChange={() => toggleBlock(block.id)}
                              />
                              {catalogEntry?.label || block.type}
                            </label>
                            <button
                              onClick={() => removeBlock(block.id)}
                              className="text-xs text-[#A6472F] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {availableToAdd.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#241F1C] mb-2">Add a section</h3>
                    <div className="space-y-2">
                      {availableToAdd.map((entry) => (
                        <button
                          key={entry.type}
                          onClick={() => addBlock(entry)}
                          className="w-full text-left border border-dashed border-[#E3D2B4] rounded-xl px-3 py-2.5 text-sm text-[#5B5347] hover:border-[#A6472F] hover:text-[#A6472F] transition-colors"
                        >
                          + {entry.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "Images" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#241F1C] mb-1">Hero banner</h3>
                  <p className="text-xs text-[#8A7C63] mb-3">Shown at the top of your storefront.</p>
                  {shop.hero_image_url && (
                    <img
                      src={shop.hero_image_url}
                      alt="Hero"
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                  )}
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => heroInputRef.current.click()}
                    disabled={uploadingHero}
                    className="bg-[#E3D2B4] hover:bg-[#DDCBAE] disabled:opacity-50 text-[#5B5347] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {uploadingHero ? "Uploading..." : shop.hero_image_url ? "Change banner" : "Upload banner"}
                  </button>
                </div>

                {hasNavbar && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#241F1C] mb-1">Logo</h3>
                    <p className="text-xs text-[#8A7C63] mb-3">Shown next to your shop name in the navbar.</p>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current.click()}
                      disabled={uploadingLogo}
                      className="bg-[#E3D2B4] hover:bg-[#DDCBAE] disabled:opacity-50 text-[#5B5347] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      {uploadingLogo ? "Uploading..." : "Upload logo"}
                    </button>
                  </div>
                )}

                {!hasNavbar && (
                  <p className="text-xs text-[#8A7C63]">
                    Add a Navbar section under Layout to enable a logo upload.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs text-[#8A7C63] mb-2">Live preview</p>
          <StorefrontPreview shop={shop} products={products} themeConfig={themeConfig} />
        </div>
      </div>
    </div>
  )
}