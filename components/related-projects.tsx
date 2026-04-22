"use client"
import { useState } from "react"
import Link from "next/link"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"
import type React from "react"

export function RelatedProjects({ currentId }: { currentId: string }) {
  const related = mainProjects.filter(p => p.id !== currentId && !(p as any).hidden).slice(0, 2)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="mt-12">
      <p className="section-label mb-6">Also check out</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {related.map((project) => (
          <Link key={project.id} href={`/work/${project.id}`} style={{ textDecoration: "none" }}>
            <div
              style={{ cursor: "pointer" }}
              onMouseEnter={() => { setHoveredId(project.id); (document.querySelector(`#rel-img-${project.id}`) as HTMLElement)?.style.setProperty("transform", "scale(1.02)") }}
              onMouseLeave={() => { setHoveredId(null); (document.querySelector(`#rel-img-${project.id}`) as HTMLElement)?.style.setProperty("transform", "scale(1)") }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: 16,
                cornerShape: "squircle",
                background: "var(--surface)",
                marginBottom: 10,
              } as React.CSSProperties}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 16, cornerShape: "squircle" } as React.CSSProperties}>
                  <div id={`rel-img-${project.id}`} style={{ width: "100%", height: "100%", transition: "transform 0.35s ease" }}>
                    <ProjectImageCycler
                      images={[project.image, (project as any).image2, (project as any).image3]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                  {project.title}
                  {project.description && (
                    <span style={{ color: "var(--text-3)" }}> — {project.description}</span>
                  )}
                </p>
                <span style={{ fontSize: 12, color: "var(--text-4)", flexShrink: 0, fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.03em" }}>
                  {project.year}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
