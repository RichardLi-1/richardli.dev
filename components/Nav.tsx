"use client"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function Nav() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 0",
        borderBottom: "1px solid var(--border-2)",
        marginBottom: "0",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "'Toronto Subway', 'Helvetica Neue', sans-serif",
          fontSize: "13px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text)",
          textDecoration: "none",
        }}
      >
        Richard Li
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "'Toronto Subway', 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
        <Link
          href="/projects"
          style={{
            fontFamily: "'Toronto Subway', 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          Work
        </Link>
        <Link
          href="/transit/photography"
          style={{
            fontFamily: "'Toronto Subway', 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          Photography
        </Link>
        <Link
          href="/transit/fanning"
          style={{
            fontFamily: "'Toronto Subway', 'Helvetica Neue', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            textDecoration: "none",
          }}
        >
          Fanning
        </Link>
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle light/dark mode"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              padding: "0",
            }}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}
      </div>
    </nav>
  )
}
