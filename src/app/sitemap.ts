import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const [settings, services, projects, posts] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false }),
    payload.find({ collection: 'services', limit: 100, depth: 0, select: { slug: true, updatedAt: true }, overrideAccess: false }),
    payload.find({
      collection: 'projects',
      limit: 500,
      depth: 0,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
      overrideAccess: false,
    }),
    payload.find({
      collection: 'posts',
      limit: 500,
      depth: 0,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
      overrideAccess: false,
    }),
  ])
  const locales = settings.enableKy ? ['ru', 'ky'] : ['ru']
  const entry = (path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}/ru${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
  })
  return [
    entry('', undefined, 1),
    entry('/services', undefined, 0.9),
    entry('/projects', undefined, 0.9),
    entry('/about', undefined, 0.6),
    entry('/process', undefined, 0.6),
    entry('/faq', undefined, 0.6),
    entry('/contacts', undefined, 0.8),
    entry('/news', undefined, 0.5),
    ...services.docs.map((d) => entry(`/services/${d.slug}`, d.updatedAt, 0.9)),
    ...projects.docs.map((d) => entry(`/projects/${d.slug}`, d.updatedAt, 0.8)),
    ...posts.docs.map((d) => entry(`/news/${d.slug}`, d.updatedAt, 0.5)),
  ]
}
