import { mainProjects } from "@/components/mainProjects"

type WorkRouteCandidate = {
  slug: string
  label: string
  aliases?: string[]
}

const extraWorkRoutes: WorkRouteCandidate[] = [
  { slug: "markville-rfp", label: "Markville RFP", aliases: ["markville", "rfp", "markville secondary plan"] },
  { slug: "classprofile", label: "Class Profile", aliases: ["class profile"] },
  { slug: "cec", label: "Career Education Council", aliases: ["career education council"] },
  { slug: "4sight", label: "4sight", aliases: ["four sight", "foursight"] },
]

const workRouteCandidates: WorkRouteCandidate[] = [
  ...mainProjects.map(project => ({
    slug: project.id,
    label: project.title,
    aliases: [project.title],
  })),
  ...extraWorkRoutes,
]

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[%_]+/g, " ")
    .replace(/[-/]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
}

function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const previousRow = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 0; i < a.length; i += 1) {
    let previousDiagonal = previousRow[0]
    previousRow[0] = i + 1

    for (let j = 0; j < b.length; j += 1) {
      const currentCell = previousRow[j + 1]
      const substitutionCost = a[i] === b[j] ? 0 : 1
      previousRow[j + 1] = Math.min(
        previousRow[j + 1] + 1,
        previousRow[j] + 1,
        previousDiagonal + substitutionCost
      )
      previousDiagonal = currentCell
    }
  }

  return previousRow[b.length]
}

function similarityScore(input: string, candidate: string) {
  if (!input || !candidate) return 0
  if (input === candidate) return 1
  if (candidate.includes(input) || input.includes(candidate)) return 0.92

  const distance = levenshteinDistance(input, candidate)
  const longestLength = Math.max(input.length, candidate.length)
  return longestLength === 0 ? 0 : 1 - distance / longestLength
}

export function getSuggestedWorkSlug(pathname: string) {
  const match = pathname.match(/^\/work\/([^/?#]+)/)
  if (!match) return null

  const rawSlug = decodeURIComponent(match[1])
  const normalizedInput = normalizeSlugPart(rawSlug)
  if (!normalizedInput) return null

  let bestMatch: { slug: string; label: string; score: number } | null = null

  for (const candidate of workRouteCandidates) {
    const candidateNames = [candidate.slug, candidate.label, ...(candidate.aliases ?? [])]
      .map(normalizeSlugPart)
      .filter(Boolean)

    const score = Math.max(...candidateNames.map(name => similarityScore(normalizedInput, name)))
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { slug: candidate.slug, label: candidate.label, score }
    }
  }

  if (!bestMatch) return null

  const minimumScore = normalizedInput.length <= 4 ? 0.75 : 0.58
  return bestMatch.score >= minimumScore ? bestMatch : null
}
