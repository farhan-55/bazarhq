export default function PromoBanner({ props }) {
  const heading = props?.heading || "Special offer"
  const subheading = props?.subheading || "Check out what's new"
  const imageUrl = props?.imageUrl

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div
        className="rounded-2xl border overflow-hidden flex items-center"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        {imageUrl && (
          <img src={imageUrl} alt={heading} className="w-32 h-24 object-cover shrink-0" />
        )}
        <div className="px-5 py-4">
          <p className="font-semibold" style={{ color: "var(--color-text)" }}>{heading}</p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>{subheading}</p>
        </div>
      </div>
    </div>
  )
}
