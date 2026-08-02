export default function PromoBanner({ props }) {
  const heading = props?.heading || "Special offer"
  const subheading = props?.subheading || "Check out what's new"
  const imageUrl = props?.imageUrl

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div
        className="rounded-2xl overflow-hidden flex items-center shadow-sm"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {imageUrl && (
          <img src={imageUrl} alt={heading} className="w-36 h-28 object-cover shrink-0" />
        )}
        <div className="px-6 py-5">
          <p className="font-semibold text-lg tracking-tight" style={{ color: "var(--color-text)" }}>
            {heading}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            {subheading}
          </p>
        </div>
      </div>
    </div>
  )
}
