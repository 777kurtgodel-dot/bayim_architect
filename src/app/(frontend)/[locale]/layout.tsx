import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { Analytics } from '@/components/site/Analytics'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { PhoneIcon, WhatsAppIcon } from '@/components/site/Icons'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { getServices, getSettings, isPreview } from '@/lib/payload'
import { SITE_URL, kyEnabled, mapPoint, mediaObj, safeHttpUrl, telHref, whatsappHref } from '@/lib/site'
import '../styles.css'

const font = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

// Страницы кэшируются и обновляются сразу после сохранения в админке (см. hooks/revalidate.ts)
export const revalidate = 3600
export async function generateStaticParams() {
  return [] // все страницы генерируются при первом посещении, сборке не нужна база данных
}

export const viewport: Viewport = { themeColor: '#004F42', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const settings = await getSettings(locale)
  return {
    metadataBase: new URL(SITE_URL),
    title: settings.defaultSeo?.title || settings.companyName || 'Байым',
    description: settings.defaultSeo?.description || undefined,
    applicationName: settings.companyName || 'Байым',
    icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }], apple: '/apple-touch-icon.png' },
    formatDetection: { telephone: true },
  }
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const [settings, services, preview] = await Promise.all([getSettings(locale), getServices(locale), isPreview()])
  // Кыргызская версия открывается, только если включена в «Настройках сайта → Языки»
  if (locale === 'ky' && !kyEnabled(settings)) notFound()

  const dict = getDictionary(locale)
  const wa = whatsappHref(
    settings,
    locale === 'ky' ? 'Саламатсызбы! Сайттан жазып жатам.' : 'Здравствуйте! Пишу с сайта «Байым».',
  )
  const tel = telHref(settings.phone)
  const logo = mediaObj(settings.logo)?.url || '/logo.webp'
  const logoLight = mediaObj(settings.logoLight)?.url || '/logo-white.webp'
  const brand = settings.companyName || 'Байым'
  const mapLink = safeHttpUrl(settings.mapLink)
  const point = mapPoint(mapLink)

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: brand,
    description: settings.defaultSeo?.description || undefined,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-default.jpg`,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address
      ? { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'KG' }
      : undefined,
    geo: point ? { '@type': 'GeoCoordinates', latitude: point.lat, longitude: point.lng } : undefined,
    hasMap: mapLink,
    areaServed: ['Бишкек', 'Чуйская область', 'Иссык-Кульская область', 'Кыргызстан'],
    sameAs: (settings.socials || []).map((s) => s.url),
  }

  return (
    <html lang={locale} className={font.variable}>
      <body>
        <a className="skip-link" href="#main">
          {dict.skip}
        </a>
        {preview && (
          <div className="preview-bar">
            {dict.preview.banner}
            {/* Обработчик маршрута, а не страница: нужен полный переход */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/next/exit-preview">{dict.preview.exit}</a>
          </div>
        )}
        <Header
          locale={locale}
          dict={dict}
          phone={settings.phone}
          telHref={tel}
          whatsappHref={wa}
          logoUrl={logo}
          companyName={brand}
          showLangSwitch={kyEnabled(settings)}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} settings={settings} services={services} logoUrl={logoLight} />

        <a className="wa-float" href={wa} target="_blank" rel="noreferrer" aria-label={dict.cta.whatsapp}>
          <WhatsAppIcon size={30} />
        </a>
        <div className="mobile-bar">
          {tel ? (
            <a className="btn btn--ghost" href={tel}>
              <PhoneIcon size={18} /> {dict.mobileBar.call}
            </a>
          ) : (
            <Link className="btn btn--ghost" href={`/${locale}/contacts#request`}>
              {dict.mobileBar.request}
            </Link>
          )}
          <a className="btn btn--whatsapp btn--wa-solid" href={wa} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} /> {dict.mobileBar.write}
          </a>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, '\\u003c') }} />
        <Analytics analytics={settings.analytics} />
      </body>
    </html>
  )
}
