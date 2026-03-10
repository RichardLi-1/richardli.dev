"use client"
import { useState } from "react"
import Nav from "@/components/Nav"
import PhotoModal from "@/components/PhotoModal"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

const featuredPhoto = {
  title: '"Departing Norfinch"',
  photographer: "Richard Li",
  agency: "TTC",
  station: "Norfinch Oakdale Station",
  vehicle: "Alstom Citadis Spirit",
  camera: "Canon EOS R50",
  focal: "200mm",
  iso: "ISO 2000",
}

const gridPhotos = [
  { id: 1, username: "_transitfanner",    bg: "#c8d4c8", title: "Arriving Finch West",     agency: "TTC",       station: "Finch West Station",       vehicle: "Alstom Citadis Spirit", camera: "Sony A7IV",     focal: "85mm",  iso: "ISO 800"  },
  { id: 2, username: "_transitfanner",    bg: "#b0c4d8", title: "Rush Hour",               agency: "TTC",       station: "Bloor-Yonge Station",      vehicle: "Toronto Rocket",        camera: "Sony A7IV",     focal: "24mm",  iso: "ISO 3200" },
  { id: 3, username: "ontariotransitkid", bg: "#d4c8b0", title: "Platform Glow",           agency: "GO",        station: "Union Station",            vehicle: "Bombardier BiLevel",    camera: "Canon R6",      focal: "35mm",  iso: "ISO 1600" },
  { id: 4, username: "richardli.ca",      bg: "#c4b8d0", title: '"Departing Norfinch"',    agency: "TTC",       station: "Norfinch Oakdale Station", vehicle: "Alstom Citadis Spirit", camera: "Canon EOS R50", focal: "200mm", iso: "ISO 2000" },
  { id: 5, username: "_transitfanner",    bg: "#b8d4c0", title: "Morning Express",         agency: "Metrolinx", station: "Bramalea GO",              vehicle: "Charger Locomotive",    camera: "Sony A7IV",     focal: "50mm",  iso: "ISO 400"  },
  { id: 6, username: "ontariotransitkid", bg: "#d0c4b8", title: "Last Train",              agency: "TTC",       station: "Sheppard-Yonge Station",   vehicle: "Toronto Rocket",        camera: "Canon R6",      focal: "28mm",  iso: "ISO 6400" },
]

export default function PhotographyPage() {
  usePageViewTracker()
  const [search, setSearch] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<typeof gridPhotos[0] | null>(null)

  const filtered = gridPhotos.filter(
    (p) =>
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.agency.toLowerCase().includes(search.toLowerCase()) ||
      p.station.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicle.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="site">
      <div className="site-inner">
        <Nav />

        <main className="main">
          {/* Hero heading */}
          <div className="hero">
            <h1 className="hero-title">Celebrating Transit Photography</h1>
            <p className="hero-sub">Featured: Feb 23, 2026</p>
          </div>

          {/* Featured card */}
          <div className="featured-card">
            <div className="featured-image-wrap">
              <div className="featured-image-placeholder" />
            </div>
            <div className="featured-caption-row">
              <div className="featured-caption-left">
                <p className="featured-title">{featuredPhoto.title}</p>
                <p className="featured-by">Taken by {featuredPhoto.photographer}</p>
              </div>
              <div className="featured-meta-grid">
                <div className="meta-col">
                  <span>{featuredPhoto.agency}</span>
                  <span>{featuredPhoto.station}</span>
                  <span>{featuredPhoto.vehicle}</span>
                </div>
                <div className="meta-col">
                  <span>{featuredPhoto.camera}</span>
                  <span>{featuredPhoto.focal}</span>
                  <span>{featuredPhoto.iso}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search + filters */}
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
            <button className="filter-btn">
              Vehicle
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button className="filter-btn">
              Agency
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Photo grid */}
          <div className="photo-grid">
            {filtered.map((photo) => (
              <div key={photo.id} className="photo-item" onClick={() => setSelectedPhoto(photo)}>
                <div className="photo-thumb" style={{ backgroundColor: photo.bg }} />
                <p className="photo-attr">@{photo.username}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="photo-footer">
          <a
            href="https://discord.gg/9n7CMmEpcb"
            target="_blank"
            rel="noreferrer"
            className="discord-link"
          >
            Join the Discord Server
          </a>
        </footer>
      </div>

      {/* Photo modal */}
      {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
    </div>
  )
}
