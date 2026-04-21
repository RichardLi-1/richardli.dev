import Nav from "@/components/Nav"
import { FanningGallery, type ContentfulPhoto } from "./FanningGallery"
import { StaggeredContent } from "@/components/staggered-content"

const SPACE = "arb5i7blr266"
const CONTENT_TYPE = "transitPhotos"

async function getPhotos(): Promise<ContentfulPhoto[]> {
  const token = process.env.CONTENTFUL_ACCESS_TOKEN
  const res = await fetch(
    `https://cdn.contentful.com/spaces/${SPACE}/environments/master/entries?access_token=${token}&content_type=${CONTENT_TYPE}&include=2&limit=1000`,
    { next: { revalidate: 3600 } },
  )

  if (!res.ok) {
    console.error("[fanning] fetch failed:", res.status, res.statusText)
    return []
  }

  const data = await res.json()

  console.log("[fanning] total entries:", data.total)
  console.log("[fanning] items count:", data.items?.length ?? 0)
  console.log("[fanning] included assets count:", data.includes?.Asset?.length ?? 0)

  // Build a lookup of asset id → asset fields
  const assetMap: Record<string, any> = {}
  for (const asset of data.includes?.Asset ?? []) {
    assetMap[asset.sys.id] = asset.fields
  }

  const photos: ContentfulPhoto[] = []
  for (const entry of data.items ?? []) {
    const photoLink = entry.fields?.photo?.sys?.id
    if (!photoLink) { console.log(`[fanning] entry ${entry.sys.id}: no photo link, skipping`); continue }
    console.log(`[fanning] entry ${entry.sys.id}: photoLink=${photoLink}`)
    const asset = assetMap[photoLink]
    console.log(`[fanning] asset for ${photoLink}:`, asset ? `url=${asset.file?.url}` : "NOT FOUND in assetMap")
    if (!asset?.file?.url) continue
    photos.push({
      id: entry.sys.id,
      url: `https:${asset.file.url}`,
      title: asset.title ?? entry.fields?.title ?? "",
      description: asset.description ?? entry.fields?.description ?? "",
      featured: entry.fields?.featured ?? false,
      agency: entry.fields?.agency ?? undefined,
      station: entry.fields?.station ?? undefined,
      vehicle: entry.fields?.vehicle ?? undefined,
      fStop: entry.fields?.fStopReal ?? undefined,
      exposureTime: entry.fields?.exposureTime ?? undefined,
      focal: entry.fields?.focal ?? undefined,
      camera: entry.fields?.camera ?? undefined,
    })
  }

  console.log("[fanning] photos resolved:", photos.length)
  return photos
}


import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"


export default async function FanningPage() {
  const photos = await getPhotos()

  return (
    <div className="site">
      <AnimatedPage>
      <StaggeredContent delay={0}>
        <AnimatedHeader currentPage="/404" backHref="/" backText="Home" />
      </StaggeredContent>

      <div className="site-inner">
        {false && <Nav /> }
        <StaggeredContent delay={100}>
          <FanningGallery photos={photos} />
        </StaggeredContent>
      </div>
      </AnimatedPage>
    </div>
  )
}
