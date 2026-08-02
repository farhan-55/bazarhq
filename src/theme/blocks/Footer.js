export default function Footer({ shop }) {
  return (
    <div
      className="border-t px-6 py-8 mt-8 text-center"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {shop.name} · Powered by BazarHQ
      </p>
    </div>
  )
}
