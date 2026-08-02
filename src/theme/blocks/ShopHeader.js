export default function ShopHeader({ shop }) {
  return (
    <div
      style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 18%, var(--color-surface))" }}
      className="border-b px-6 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold" style={{ color: "var(--color-text)" }}>
          {shop.name}
        </h1>
      </div>
    </div>
  )
}
