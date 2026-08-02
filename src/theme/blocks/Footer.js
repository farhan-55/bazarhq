export default function Footer({ shop }) {
  return (
    <div
      className="border-t px-6 py-10 mt-4"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          {shop.name}
        </p>
        <p className="text-xs mt-1.5" style={{ color: "var(--color-muted)" }}>
          Powered by BazarHQ
        </p>
      </div>
    </div>
  )
}
