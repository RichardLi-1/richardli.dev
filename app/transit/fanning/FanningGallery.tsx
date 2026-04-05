"use client"
import { useState } from "react"

export interface ContentfulPhoto {
  id: string
  url: string
  title: string
  description: string
  featured?: boolean
  agency?: string
  station?: string
  vehicle?: string
  fStop?: string
  exposureTime?: string
  focal?: string
  camera?: string
}

const SKELETON_COLORS = [
  "#c8d4c8", // sage green
  "#b0c4d8", // steel blue
  "#d4c8b0", // warm sand
  "#c4b8d0", // soft lavender
  "#b8d4c0", // mint
  "#d0c4b8", // warm beige
]

export function FanningGallery({ photos }: { photos: ContentfulPhoto[] }) {
  const [selected, setSelected] = useState<ContentfulPhoto | null>(null)
  const [search, setSearch] = useState("")
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set())
  const [featuredLoaded, setFeaturedLoaded] = useState(false)

  // Use the explicitly featured photo, fallback to first
  const featured = photos.find((p) => p.featured) ?? photos[0] ?? null
  const gridPhotos = photos.filter((p) => p !== featured)

  const filtered = gridPhotos.filter(
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

      {/* ── Featured card ── */}
      {featured && (
        <div className="featured-card" onClick={() => setSelected(featured)} style={{ cursor: "pointer" }}>
          <div className="featured-image-wrap" style={{ position: "relative" }}>
            {!featuredLoaded && <div className="featured-image-placeholder" />}
            <img
              src={`${featured.url}?w=1400`}
              alt={featured.title}
              onLoad={() => setFeaturedLoaded(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: featuredLoaded ? 1 : 0,
                transition: "opacity 0.4s ease",
                position: featuredLoaded ? "static" : "absolute",
              }}
            />
          </div>
          <div className="featured-caption-row">
            <div className="featured-caption-left">
              <p className="featured-title">{featured.title}</p>
              <p className="featured-by">@_transitfanner</p>
            </div>
            <div className="featured-meta-grid">
              {(featured.agency || featured.station || featured.vehicle) && (
                <div className="meta-col">
                  {featured.agency    && <span>{featured.agency}</span>}
                  {featured.station   && <span>{featured.station}</span>}
                  {featured.vehicle   && <span>{featured.vehicle}</span>}
                </div>
              )}
              {(featured.camera || featured.focal || featured.fStop || featured.exposureTime) && (
                <div className="meta-col">
                  {featured.camera       && <span>{featured.camera}</span>}
                  {featured.focal        && <span>{featured.focal}</span>}
                  {featured.fStop        && <span>f/{featured.fStop}</span>}
                  {featured.exposureTime && <span>{featured.exposureTime}s</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Search toolbar ── */}
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

      {/* ── Photo grid ── */}
      <div className="fanning-grid">
        {filtered.length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>
            {gridPhotos.length === 0 ? "No photos yet." : "No photos match your search."}
          </p>
        ) : (
          filtered.map((photo, i) => (
            <div key={photo.id} className="photo-item" onClick={() => setSelected(photo)}>
              <div
                className="photo-thumb"
                style={{
                  overflow: "hidden",
                  position: "relative",
                  aspectRatio: "unset",
                  height: loadedIds.has(photo.id) ? "auto" : 200,
                  backgroundColor: loadedIds.has(photo.id) ? "transparent" : SKELETON_COLORS[i % SKELETON_COLORS.length],
                  backgroundImage: loadedIds.has(photo.id)
                    ? "none"
                    : "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: loadedIds.has(photo.id) ? "none" : "shimmer 2s ease-in-out infinite",
                }}
              >
                <img
                  src={`${photo.url}?w=800`}
                  alt={photo.title}
                  onLoad={() => setLoadedIds(s => new Set(s).add(photo.id))}
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 20,
                    opacity: loadedIds.has(photo.id) ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>
              {photo.title && <p className="photo-attr">{photo.title}</p>}
            </div>
          ))
        )}
      </div>

      {/* ── Modal ── */}
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
              // fit-content lets the card shrink to the image's natural rendered width
              width: "fit-content",
              maxWidth: "52vw",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <img
              src={`${selected.url}?w=1400`}
              alt={selected.title}
              style={{
                display: "block",
                // constrain by height so portrait photos don't overflow the screen,
                // width:auto lets it scale proportionally — the card then hugs that width
                maxHeight: "70vh",
                maxWidth: "52vw",
                width: "auto",
                height: "auto",
              }}
            />
            <div style={{ padding: "20px 24px 24px" }}>
              {/* Title row + close button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: 17, color: "var(--text)", marginBottom: 4, letterSpacing: "0.01em" }}>
                    {selected.title}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    @_transitfanner
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "var(--surface)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
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

              {/* 2-column metadata grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                {[
                  selected.agency        ? ["Agency",        selected.agency]                  : null,
                  selected.camera        ? ["Camera",        selected.camera]                  : null,
                  selected.station       ? ["Station",       selected.station]                 : null,
                  selected.focal         ? ["Focal Length",  selected.focal]                   : null,
                  selected.vehicle       ? ["Vehicle",       selected.vehicle]                 : null,
                  selected.fStop         ? ["Aperture",      `f/${selected.fStop}`]            : null,
                  selected.exposureTime  ? ["Exposure",      `${selected.exposureTime}s`]      : null,
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label as string}>
                    <p style={{ fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-2)", letterSpacing: "0.02em" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
