import Link from 'next/link'
import React from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'
import { safeHttpUrl, telegramLink, telHref } from '@/lib/site'
import type { Service, SiteSetting } from '@/payload-types'
import { SocialIcon } from './Icons'

type Props = { locale: Locale; dict: Dictionary; settings: SiteSetting; services: Service[]; logoUrl: string }

export function Footer({ locale, dict, settings, services, logoUrl }: Props) {
  const year = new Date().getFullYear()
  const mapLink = safeHttpUrl(settings.mapLink)
  const tg = telegramLink(settings.telegram)
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={settings.companyName || 'Байым'} width={128} height={64} loading="lazy" />
          {settings.tagline && <p>{settings.tagline}</p>}
          {settings.regions && <p className="muted-light">{settings.regions}</p>}
          {settings.socials && settings.socials.length > 0 && (
            <div className="socials">
              {settings.socials.map((s) => (
                <a key={s.id || s.url} href={s.url} target="_blank" rel="noreferrer" aria-label={s.network}>
                  <SocialIcon network={s.network} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4>{dict.footer.services}</h4>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/${locale}/services/${s.slug}`}>{s.shortTitle || s.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>{dict.footer.nav}</h4>
          <ul>
            <li>
              <Link href={`/${locale}/projects`}>{dict.nav.projects}</Link>
            </li>
            <li>
              <Link href={`/${locale}/about`}>{dict.nav.about}</Link>
            </li>
            <li>
              <Link href={`/${locale}/process`}>{dict.nav.process}</Link>
            </li>
            <li>
              <Link href={`/${locale}/faq`}>{dict.nav.faq}</Link>
            </li>
            <li>
              <Link href={`/${locale}/news`}>{dict.nav.news}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contacts`}>{dict.nav.contacts}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>{dict.footer.contacts}</h4>
          <ul className="footer-contacts">
            {settings.phone && (
              <li>
                <a href={telHref(settings.phone)}>{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            {tg && (
              <li>
                <a href={tg.href} target="_blank" rel="noreferrer">
                  Telegram: {tg.label}
                </a>
              </li>
            )}
            {settings.address && (
              <li>
                {mapLink ? (
                  <a href={mapLink} target="_blank" rel="noreferrer">
                    {settings.address}
                  </a>
                ) : (
                  settings.address
                )}
              </li>
            )}
            {settings.workHours && <li className="muted-light">{settings.workHours}</li>}
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>
          © {year} {settings.companyName}. {dict.footer.rights}
        </span>
        {settings.footerNote && <span>{settings.footerNote}</span>}
        <Link href={`/${locale}/privacy`}>{dict.footer.privacy}</Link>
      </div>
    </footer>
  )
}
