"use client"
import { useState } from "react"

export interface ContentfulPhoto {
  id: string
  url: string
  title: string
  description: string
}

export function FanningGallery({ photos }: { photos: ContentfulPhoto[] }) {
  const [selected, setSelected] = useState<ContentfulPhoto | null>(null)
  const [search, setSearch] = useState("")

  const filtered = photos.filter(
    (p) =>
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main className="main">
      <div className="hero">
        <h1 className="hero-title">Transit Fanning</h1>
        <p className="hero-sub">Photos from around the network</p>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search photos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="photo-grid">
        {filtered.length === 0 ? (
          <p style={{ color: "var(--text-3)", gridColumn: "1 / -1", fontSize: 14 }}>
            {photos.length === 0 ? "No photos yet." : "No photos match your search."}
          </p>
        ) : (
          filtered.map((photo) => (
            <div key={photo.id} className="photo-item" onClick={() => setSelected(photo)}>
              <div className="photo-thumb" style={{ overflow: "hidden", position: "relative" }}>
                <img
                  src={`${photo.url}?w=600&h=450&fit=fill&f=center`}
                  alt={photo.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 20 }}
                />
              </div>
              {photo.title && <p className="photo-attr">{photo.title}</p>}
            </div>
          ))
        )}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card-bg)",
              borderRadius: 28,
              overflow: "hidden",
              width: "min(700px, 92vw)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <img
              src={`${selected.url}?w=1400&fit=fill`}
              alt={selected.title}
              style={{ width: "100%", display: "block", maxHeight: "72vh", objectFit: "contain" }}
            />
            {(selected.title || selected.description) && (
              <div style={{ padding: "16px 22px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  {selected.title && (
                    <p style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 15, color: "var(--text)", marginBottom: 4, letterSpacing: "0.01em" }}>
                      {selected.title}
                    </p>
                  )}
                  {selected.description && (
                    <p style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.02em", lineHeight: 1.6 }}>
                      {selected.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "var(--surface)",
                    border: "none",
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    color: "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
