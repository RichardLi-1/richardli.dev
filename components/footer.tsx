export function Footer() {
  return (
    <footer className="flex w-full justify-center border-t" style={{ borderColor: "var(--border-2)", color: "var(--text-3)", background: "var(--bg)" }}>
      <div className="flex w-full max-w-6xl flex-col gap-2 p-4">
        {/* Top row: name + version */}
        <div className="flex items-center justify-between">
          <span className="font-serif italic">Richard Li</span>
          <div className="flex items-center gap-2">
            <div className="relative flex size-2 items-center justify-center">
              <div className="size-2 rounded-full bg-green-400 animate-pulse-custom"></div>
            </div>
            <span className="text-sm">Version 2.0.0 - Updated 02/25/2025</span>
          </div>
        </div>

        {/* Bottom row: built with */}
        <span style={{ fontFamily: "'SFCamera', sans-serif", color: "var(--text-3)", fontSize: "12px", opacity: 0.6 }}>
          Built with Next.js and TypeScript. Set in SFCamera and Toronto Subway.
        </span>

        {/* Spacer for mobile floating pill nav */}
        <div className="block md:hidden" style={{ height: "4rem" }} />
      </div>
    </footer>
  )
}
