export default function CategoryStrip({ products }) {
  const categories = [...new Set((products || []).map((p) => p.category).filter(Boolean))]

  if (categories.length === 0) return null

  return (
    <div
      className="border-b"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2.5 flex-wrap">
        {categories.map((cat) => (
          <span
            key={cat}
            className="text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full shadow-sm"
            style={{
              color: "var(--color-text)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}
