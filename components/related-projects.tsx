"use client"
import Link from "next/link"
import { mainProjects } from "@/components/mainProjects"
import { ProjectImageCycler } from "@/components/project-image-cycler"

export function RelatedProjects({ currentId }: { currentId: string }) {
  const related = mainProjects.filter(p => p.id !== currentId).slice(0, 2)

  return (
    <div className="mt-12">
      <p className="section-label mb-6">Also check out</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {related.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <div
              className="photo-card h-full flex flex-col cursor-pointer group"
              style={{ "--glow-color": project.colors || "#22c55e44" } as React.CSSProperties}
            >
              <div
                className="w-full overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0px_120px_-20px_var(--glow-color)]"
                style={{ aspectRatio: "16/9", background: "var(--surface)", borderRadius: "16px 16px 0 0" }}
              >
                <ProjectImageCycler
                  images={[project.image, (project as any).image2, (project as any).image3]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              </div>
              <div className="px-5 py-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h3 style={{ fontSize: "15px", letterSpacing: "0.02em", fontWeight: 500, color: "var(--text)" }}>
                    {project.title}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-3)", letterSpacing: "0.04em" }}>{project.year}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6" }}>{project.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
