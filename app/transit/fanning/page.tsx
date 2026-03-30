import Nav from "@/components/Nav"
import { FanningGallery, type ContentfulPhoto } from "./FanningGallery"

const SPACE = "arb5i7blr266"
const CONTENT_TYPE = "transitPhotos"

async function getPhotos(): Promise<ContentfulPhoto[]> {
  const token = process.env.CONTENTFUL_ACCESS_TOKEN
  const res = await fetch(
    `https://cdn.contentful.com/spaces/${SPACE}/environments/master/entries?access_token=${token}&content_type=${CONTENT_TYPE}&include=2`,
    { next: { revalidate: 3600 } },
  )

  if (!res.ok) return []

  const data = await res.json()

  // Build a lookup of asset id → asset fields
  const assetMap: Record<string, any> = {}
  for (const asset of data.includes?.Asset ?? []) {
    assetMap[asset.sys.id] = asset.fields
  }

  const photos: ContentfulPhoto[] = []
  for (const entry of data.items ?? []) {
    const photoLink = entry.fields?.photo?.sys?.id
    if (!photoLink) continue
    const asset = assetMap[photoLink]
    if (!asset?.file?.url) continue
    photos.push({
      id: entry.sys.id,
      url: `https:${asset.file.url}`,
      title: asset.title ?? entry.fields?.title ?? "",
      description: asset.description ?? entry.fields?.description ?? "",
    })
  }

  return photos
}


import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"


export default async function FanningPage() {
  const photos = await getPhotos()

  return (
    <div className="site">
      <AnimatedPage>
      <AnimatedHeader currentPage="/404" backHref="/" backText="Home" />

      <div className="site-inner">

        {false && <Nav /> }
        <FanningGallery photos={photos} />
      </div>
      </AnimatedPage>
    </div>
  )
}
