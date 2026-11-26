import type { Metadata } from 'next'
import React from 'react'
import { PageHero } from '@/components/site/Blocks'
import { PhoneIcon, SocialIcon, WhatsAppIcon } from '@/components/site/Icons'
import { LeadForm } from '@/components/site/LeadForm'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getServices, getSettings } from '@/lib/payload'
import { buildMetadata, is2gisLink, mapPoint, safeHttpUrl, telegramLink, telHref, whatsappHref, type MapPoint } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  const settings = await getSettings(locale)
  return buildMetadata({
    locale,
    path: '/contacts',
    title: dict.contacts.title,
    description: [settings.phone, settings.address, settings.email].filter(Boolean).join(' · ') || dict.contacts.lead,
    settings,
  })
}

/** Карта: своя карта из настроек, точка из ссылки 2ГИС / Google Maps или поиск по адресу */
const mapSrc = (locale: Locale, embed?: string | null, point?: MapPoint | null, address?: string | null) => {
  if (embed) {
    const m = embed.match(/src="([^"]+)"/)
    return safeHttpUrl(m ? m[1] : embed) || null
  }
  const q = point ? `${point.lat},${point.lng}` : address ? encodeURIComponent(address) : null
  if (!q) return null
  return `https://maps.google.com/maps?q=${q}&z=${point ? 17 : 16}&hl=${locale}&output=embed`
}

export default async function ContactsPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services] = await Promise.all([getSettings(locale), getServices(locale)])
  const c = dict.contacts
  const wa = whatsappHref(settings, locale === 'ky' ? 'Саламатсызбы!' : 'Здравствуйте!')
  const tel = telHref(settings.phone)
  const mapLink = safeHttpUrl(settings.mapLink)
  const map = mapSrc(locale, settings.mapEmbed, mapPoint(mapLink), settings.address)
  const routeHref =
    mapLink || (settings.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : null)
  const routeLabel = is2gisLink(mapLink) ? c.open2gis : c.route
  const tg = telegramLink(settings.telegram)

  return (
    <>
      <PageHero eyebrow={settings.companyName || undefined} title={c.title} lead={c.lead} />
      <section className="section section--tight">
        <div className="container contacts-grid">
          <div>
            <dl className="contact-list">
              {settings.phone && (
                <div>
                  <dt>{c.phone}</dt>
                  <dd>
                    <a href={tel}>{settings.phone}</a>
                  </dd>
                </div>
              )}
              {settings.email && (
                <div>
                  <dt>{c.email}</dt>
                  <dd>
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </dd>
                </div>
              )}
              {tg && (
                <div>
                  <dt>Telegram</dt>
                  <dd>
                    <a href={tg.href} target="_blank" rel="noreferrer">
                      {tg.label}
                    </a>
                  </dd>
                </div>
              )}
              {settings.address && (
                <div>
                  <dt>{c.address}</dt>
                  <dd>{settings.address}</dd>
                </div>
              )}
              {settings.workHours && (
                <div>
                  <dt>{c.hours}</dt>
                  <dd>{settings.workHours}</dd>
                </div>
              )}
              {settings.regions && (
                <div>
                  <dt>{c.regions}</dt>
                  <dd>{settings.regions}</dd>
                </div>
              )}
              {settings.socials && settings.socials.length > 0 && (
                <div>
                  <dt>{c.socials}</dt>
                  <dd style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {settings.socials.map((s) => (
                      <a key={s.id || s.url} href={s.url} target="_blank" rel="noreferrer" className="tag" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <SocialIcon network={s.network} size={16} /> {s.network[0].toUpperCase() + s.network.slice(1)}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            <div className="contacts-actions">
              <a href={wa} className="btn btn--primary btn--lg" target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> {dict.cta.whatsapp}
              </a>
              {tel && (
                <a href={tel} className="btn btn--ghost btn--lg">
                  <PhoneIcon size={18} /> {dict.cta.call}
                </a>
              )}
              {routeHref && (
                <a href={routeHref} className="btn btn--ghost btn--lg" target="_blank" rel="noreferrer">
                  {routeLabel}
                </a>
              )}
            </div>
          </div>
          {map && (
            <div className="map marks">
              <iframe src={map} title={settings.address || c.title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          )}
        </div>
      </section>
      <section className="section section--paper" id="request">
        <div className="container container--narrow">
          <p className="eyebrow">{dict.form.title}</p>
          <h2 className="section-title" style={{ marginBottom: 32 }}>
            {dict.cta.consult}
          </h2>
          <div className="cta-section__form">
            <LeadForm
              dict={dict}
              locale={locale}
              services={services.map((s) => ({ id: s.id, title: s.title }))}
              formType="contacts"
              whatsappHref={wa}
            />
          </div>
        </div>
      </section>
    </>
  )
}
