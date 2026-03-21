"use client"
import { useEffect } from "react"

interface Photo {
  id: number
  username: string
  bg: string
  title: string
  agency: string
  station: string
  vehicle: string
  camera: string
  focal: string
  iso: string
}

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          borderRadius: "28px",
          overflow: "hidden",
          width: "min(540px, 90vw)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* Placeholder image */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4/3",
            backgroundColor: photo.bg,
            backgroundImage:
              "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
        />

        {/* Details */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Toronto Subway', 'Toronto Subway', sans-serif",
                  fontSize: "17px",
                  color: "var(--text)",
                  marginBottom: "4px",
                  letterSpacing: "0.01em",
                }}
              >
                {photo.title}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-3)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                @{photo.username}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--surface)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 24px",
            }}
          >
            {[
              ["Agency", photo.agency],
              ["Camera", photo.camera],
              ["Station", photo.station],
              ["Focal Length", photo.focal],
              ["Vehicle", photo.vehicle],
              ["ISO", photo.iso],
            ].map(([label, value]) => (
              <div key={label}>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--text-4)",
                    marginBottom: "2px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-2)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
