export default function CategoryStrip({ products }) {
  const categories = [...new Set((products || []).map((p) => p.category).filter(Boolean))]

  if (categories.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <span
          key={cat}
          className="text-xs font-medium px-3 py-1.5 rounded-full border"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {cat}
        </span>
      ))}
    </div>
  )
}
