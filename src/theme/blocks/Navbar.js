import Link from "next/link"

export default function Navbar({ shop, slug, props }) {
  const logoUrl = props?.logoUrl
  const showSearch = props?.showSearch !== false

  return (
    <div
      className="border-b px-6 py-4"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <Link href={`/shop/${slug}`} className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={shop.name} className="h-9 w-9 rounded-full object-cover" />
          ) : null}
          <span className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            {shop.name}
          </span>
        </Link>

        {showSearch && (
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search this shop..."
              disabled
              className="w-full rounded-full border px-4 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-muted)",
              }}
            />
          </div>
        )}

        <Link
          href={`/shop/${slug}/cart`}
          className="ml-auto text-sm font-medium shrink-0"
          style={{ color: "var(--color-accent)" }}
        >
          Cart
        </Link>
      </div>
    </div>
  )
}
