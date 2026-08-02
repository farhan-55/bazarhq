import Link from "next/link"

export default function ProductGrid({ shop, products, slug, props }) {
  const columns = props?.columns || 4
  const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns] || "sm:grid-cols-4"

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {!products || products.length === 0 ? (
        <div
          className="rounded-2xl border px-8 py-12 text-center shadow-sm"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>No products available yet.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-2 ${colClass} gap-6`}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${slug}/product/${product.id}`}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    No image
                  </div>
                )}
                {product.stock_quantity !== undefined && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <span
                    className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm"
                    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-accent)" }}
                  >
                    Low stock
                  </span>
                )}
              </div>
              <div className="px-4 py-4">
                {product.category && (
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {product.category}
                  </p>
                )}
                <h3
                  className="font-medium text-sm leading-snug mb-2 line-clamp-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {product.name}
                </h3>
                <p className="text-base font-semibold tracking-tight" style={{ color: "var(--color-accent)" }}>
                  <span className="text-xs font-normal align-top mr-0.5" style={{ color: "var(--color-muted)" }}>Tk</span>
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}