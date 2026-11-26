import config from '@payload-config'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Locale } from './i18n'

export const getPayloadClient = cache(() => getPayload({ config }))

/** Режим предпросмотра черновиков (включается кнопкой «Предпросмотр» в админке) */
export const isPreview = cache(async () => (await draftMode()).isEnabled)

/** Пользователь админки — нужен только в режиме предпросмотра, чтобы видеть черновики */
const previewUser = cache(async () => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  return user
})

// Все запросы с сайта идут с правами анонимного посетителя (overrideAccess: false),
// поэтому черновики и служебные поля (например, адреса для уведомлений) наружу не попадают.

export const getSettings = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1, overrideAccess: false })
})

export const getGlobal = cache(async <T extends 'home-page' | 'about-page' | 'process-page'>(slug: T, locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug, locale, depth: 1, overrideAccess: false })
})

export const getServices = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'services',
    locale,
    depth: 1,
    limit: 50,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
  })
  return res.docs
})

/** Список проектов для карточек — только нужные поля, без галерей */
export const getProjects = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'projects',
    locale,
    depth: 1,
    limit: 300,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
    where: { _status: { equals: 'published' } },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      cover: true,
      status: true,
      projectType: true,
      services: true,
      location: true,
      showLocation: true,
      year: true,
      featured: true,
      order: true,
    },
    populate: {
      services: { title: true, shortTitle: true, slug: true },
      'project-types': { title: true, slug: true },
    },
  })
  return res.docs
})

export const getProject = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayloadClient()
  const draft = await isPreview()
  const res = await payload.find({
    collection: 'projects',
    locale,
    depth: 1,
    limit: 1,
    draft,
    overrideAccess: false,
    user: draft ? await previewUser() : undefined,
    where: { slug: { equals: slug } },
  })
  return res.docs[0] || null
})

export const getProjectTypes = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'project-types',
    locale,
    limit: 50,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
  })
  return res.docs
})

export const getPosts = cache(async (locale: Locale, limit = 24) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'posts',
    locale,
    depth: 1,
    limit,
    sort: '-publishedAt',
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
    select: { title: true, slug: true, excerpt: true, cover: true, publishedAt: true },
  })
  return res.docs
})

export const getPost = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayloadClient()
  const draft = await isPreview()
  const res = await payload.find({
    collection: 'posts',
    locale,
    depth: 1,
    limit: 1,
    draft,
    overrideAccess: false,
    user: draft ? await previewUser() : undefined,
    where: { slug: { equals: slug } },
  })
  return res.docs[0] || null
})

export const getTeam = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'team',
    locale,
    depth: 1,
    limit: 100,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
    where: { visible: { equals: true } },
  })
  return res.docs
})

export const getTestimonials = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'testimonials',
    locale,
    depth: 1,
    limit: 30,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
    where: { visible: { equals: true } },
  })
  return res.docs
})

export const getFaq = cache(async (locale: Locale, onlyHome = false) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'faq',
    locale,
    limit: 300,
    sort: 'order',
    overrideAccess: false,
    pagination: false,
    where: onlyHome ? { showOnHome: { equals: true } } : undefined,
  })
  return res.docs
})
