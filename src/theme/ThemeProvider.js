const DEFAULT_PALETTE = {
  accent: "#A6472F",
  background: "#FDF9F0",
  surface: "#FBF6EC",
  border: "#E3D2B4",
  text: "#241F1C",
  muted: "#8A7C63",
}

export const FONT_STACKS = {
  system: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
}

export default function ThemeProvider({ palette, font = "system", fullHeight = true, children }) {
  const p = { ...DEFAULT_PALETTE, ...palette }

  const style = {
    "--color-accent": p.accent,
    "--color-bg": p.background,
    "--color-surface": p.surface,
    "--color-border": p.border,
    "--color-text": p.text,
    "--color-muted": p.muted,
    backgroundColor: "var(--color-bg)",
    fontFamily: FONT_STACKS[font] || FONT_STACKS.system,
  }

  return (
    <div style={style} className={fullHeight ? "min-h-screen" : "min-h-full"}>
      <div style={{ backgroundColor: "var(--color-accent)" }} className="h-1.5 w-full" />
      {children}
    </div>
  )
}
