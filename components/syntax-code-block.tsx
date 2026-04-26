"use client"

import { useEffect, useMemo, useState } from "react"
import type { BundledLanguage } from "shiki"

type SyntaxCodeBlockProps = {
  /** Shiki / TextMate grammar id, e.g. `typescript`, `tsx`, `json` */
  language: string
  code: string
  className?: string
}

/** Map common labels to Shiki bundled language ids (invalid ids make codeToHtml throw). */
function toShikiLang(id: string): BundledLanguage {
  const k = id.toLowerCase()
  const map: Record<string, BundledLanguage> = {
    typescript: "typescript",
    ts: "typescript",
    tsx: "tsx",
    javascript: "javascript",
    js: "javascript",
    json: "json",
    bash: "bash",
    shell: "bash",
    css: "css",
    html: "html",
  }
  return map[k] ?? "typescript"
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * VS Code Dark+ colours via Shiki (TextMate grammar + same theme engine as the editor).
 * We moved off react-syntax-highlighter because Prism’s inline colours were visually
 * collapsing to one blue on the site (likely Tailwind / layer interaction on nested spans).
 */
export function SyntaxCodeBlock({ language, code, className }: SyntaxCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)
  const trimmed = useMemo(() => code.trimEnd(), [code])
  const lang = useMemo(() => toShikiLang(language), [language])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { codeToHtml } = await import("shiki")
      try {
        const out = await codeToHtml(trimmed, {
          lang,
          theme: "dark-plus",
        })
        if (!cancelled) setHtml(out)
      } catch {
        if (!cancelled) {
          setHtml(
            `<pre style="margin:0;padding:1rem;border-radius:0.5rem;background:#1e1e1e;color:#d4d4d4"><code>${escapeHtml(trimmed)}</code></pre>`,
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [trimmed, lang])

  return (
    <div
      className={`syntax-shiki-root mb-6 overflow-x-auto rounded-lg border ${className ?? ""}`}
      style={{ borderColor: "var(--border-2)" }}
    >
      {html === null ? (
        <pre
          className="m-0 rounded-lg p-4 font-mono text-[13px] leading-relaxed"
          style={{ background: "#1e1e1e", color: "#d4d4d4" }}
        >
          <code>{trimmed}</code>
        </pre>
      ) : (
        <div
          className="font-mono [&_pre]:m-0 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-left [&_pre]:text-[13px] [&_pre]:leading-relaxed"
          // Shiki output: each token is a <span style="color:…"> — no React tree, so colours survive site CSS better than Prism-in-React in our layout.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
