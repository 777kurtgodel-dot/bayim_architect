import type { Metadata } from 'next'
import type { Media, SiteSetting } from '@/payload-types'
import type { Dictionary, Locale } from './i18n'
import { SERVER_URL } from './serverUrl'

export const SITE_URL = SERVER_URL

export const whatsappHref = (settings: Pick<SiteSetting, 'whatsapp'>, text?: string) => {
  const num = (settings.whatsapp || '').replace(/\D/g, '') || '996999777888'
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export const telHref = (phone?: string | null) => (phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined)

/** Только ссылки http(s): опечатка или javascript: в настройках не попадут на сайт */
export const safeHttpUrl = (link?: string | null) => {
  const v = (link || '').trim()
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : undefined
}

export const is2gisLink = (link?: string | null) => Boolean(link && /^https?:\/\/([a-z0-9-]+\.)*2gis\.[a-z]+(\/|$)/i.test(link.trim()))

export type MapPoint = { lat: number; lng: number }

/**
 * Точка на карте из ссылки на компанию.
 * 2ГИС: …/firm/<id>/<долгота>,<широта>. Google Maps: …/@<широта>,<долгота> или ?q=<широта>,<долгота>.
 * Параметр m= в ссылке 2ГИС — это центр экрана, а не компания, поэтому он не используется.
 */
export const mapPoint = (link?: string | null): MapPoint | null => {
  if (!link) return null
  let url = link.trim()
  try {
    url = decodeURIComponent(url)
  } catch {
    // ссылка с неправильным кодированием: разбираем как есть
  }
  const num = '(-?\\d{1,3}(?:\\.\\d+)?)'
  let lat: number | undefined
  let lng: number | undefined
  const gis = is2gisLink(url) ? url.match(new RegExp(`/(?:firm|geo)/\\d+/${num},${num}`)) : null
  if (gis) {
    lng = Number(gis[1])
    lat = Number(gis[2])
  } else {
    const g = url.match(new RegExp(`@${num},${num}`)) || url.match(new RegExp(`[?&](?:q|query|ll)=${num},${num}`))
    if (g) {
      lat = Number(g[1])
      lng = Number(g[2])
    }
  }
  if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

const formatKgPhone = (digits: string) =>
  digits.length === 12 && digits.startsWith('996') ? `+996 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}` : `+${digits}`

/** Telegram из настроек: ник (baiym, @baiym, t.me/baiym) или номер телефона (+996…) */
export const telegramLink = (value?: string | null): { href: string; label: string } | null => {
  const v = (value || '').trim()
  if (!v) return null
  const rest = v.replace(/^(?:https?:\/\/)?(?:t\.me|telegram\.me)\//i, '').replace(/^@/, '').replace(/\/+$/, '')
  const digits = rest.replace(/\D/g, '')
  if (/^\+?[\d\s()-]+$/.test(rest) && digits.length >= 9) return { href: `https://t.me/+${digits}`, label: formatKgPhone(digits) }
  return /^[A-Za-z0-9_]{4,32}$/.test(rest) ? { href: `https://t.me/${rest}`, label: `@${rest}` } : null
}

export const ctaLabel = (dict: Dictionary, type?: string | null) => {
  switch (type) {
    case 'estimate':
      return dict.cta.estimate
    case 'calculate':
      return dict.cta.calculate
    case 'consult':
      return dict.cta.consult
    default:
      return dict.cta.discuss
  }
}

export const mediaObj = (m: unknown): Media | null =>
  m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null

/** Абсолютный адрес картинки для соцсетей */
const absolute = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url}`)

export const kyEnabled = (settings: Pick<SiteSetting, 'enableKy'>) => Boolean(settings.enableKy)

type SeoInput = {
  locale: Locale
  path: string
  title?: string | null
  description?: string | null
  image?: unknown
  meta?: { title?: string | null; description?: string | null; image?: unknown } | null
  settings: SiteSetting
  noIndex?: boolean
}

export function buildMetadata({ locale, path, title, description, image, meta, settings, noIndex }: SeoInput): Metadata {
  const brand = settings.companyName || 'Байым'
  const fullTitle = meta?.title || (title ? `${title} — ${brand}` : settings.defaultSeo?.title || brand)
  const desc = meta?.description || description || settings.defaultSeo?.description || undefined
  const img = mediaObj(meta?.image) || mediaObj(image) || mediaObj(settings.defaultSeo?.image)
  const ogUrl = img ? absolute(img.sizes?.og?.url || img.url || '') : `${SITE_URL}/og-default.jpg`
  const url = `${SITE_URL}/${locale}${path}`
  const languages: Record<string, string> = { ru: `${SITE_URL}/ru${path}`, 'x-default': `${SITE_URL}/ru${path}` }
  if (kyEnabled(settings)) languages.ky = `${SITE_URL}/ky${path}`
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url, languages },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: brand,
      locale: locale === 'ky' ? 'ky_KG' : 'ru_RU',
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description: desc, images: [ogUrl] },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}
