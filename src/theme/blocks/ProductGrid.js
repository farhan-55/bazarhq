import Link from "next/link"

export default function ProductGrid({ shop, products, slug, props }) {
  const columns = props?.columns || 4
  const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns] || "sm:grid-cols-4"

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {!products || products.length === 0 ? (
        <div
          className="rounded-2xl border px-8 py-12 text-center"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>No products available yet.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-2 ${colClass} gap-4`}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${slug}/product/${product.id}`}
              className="rounded-2xl border overflow-hidden transition-colors hover:border-[var(--color-accent)]"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 object-cover"
                />
              ) : (
                <div
                  className="w-full h-32 sm:h-40 flex items-center justify-center text-sm"
                  style={{ backgroundColor: "var(--color-border)", color: "var(--color-muted)" }}
                >
                  No image
                </div>
              )}
              <div className="p-3">
                <h3 className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                  {product.name}
                </h3>
                <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                  Tk {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
