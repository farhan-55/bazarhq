import Link from "next/link"

export default function Navbar({ shop, slug, props }) {
  const logoUrl = props?.logoUrl
  const showSearch = props?.showSearch !== false

  return (
    <div
      className="border-b px-6 py-4 shadow-sm"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <Link href={`/shop/${slug}`} className="flex items-center gap-2.5 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={shop.name} className="h-9 w-9 rounded-full object-cover shadow-sm" />
          ) : null}
          <span
            className="text-lg font-semibold tracking-tight uppercase"
            style={{ color: "var(--color-text)", letterSpacing: "0.02em" }}
          >
            {shop.name}
          </span>
        </Link>

        {showSearch && (
          <div className="flex-1 max-w-md relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--color-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search this shop..."
              disabled
              className="w-full rounded-full border pl-9 pr-4 py-2 text-sm outline-none"
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
          className="ml-auto text-sm font-medium shrink-0 flex items-center gap-1.5"
          style={{ color: "var(--color-accent)" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.9-4.797 2.253-7.42a1.125 1.125 0 00-1.087-1.34H5.106M14.25 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-8.25 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Cart
        </Link>
      </div>
    </div>
  )
}