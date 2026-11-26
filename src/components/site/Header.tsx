'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'
import { PhoneIcon, WhatsAppIcon } from './Icons'

type Props = {
  locale: Locale
  dict: Dictionary
  phone?: string | null
  telHref?: string
  whatsappHref: string
  logoUrl: string
  companyName: string
  showLangSwitch: boolean
}

export function Header({ locale, dict, phone, telHref, whatsappHref, logoUrl, companyName, showLangSwitch }: Props) {
  const pathname = usePathname() || `/${locale}`
  // Меню открыто только на той странице, где его открыли: при переходе по ссылке оно закрывается само
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const nav = [
    ['/services', dict.nav.services],
    ['/projects', dict.nav.projects],
    ['/about', dict.nav.about],
    ['/process', dict.nav.process],
    ['/faq', dict.nav.faq],
    ['/contacts', dict.nav.contacts],
  ] as const
  // В мобильном меню места больше: «Специалисты» идут сразу после «О компании»
  const mobileNav = [...nav.slice(0, 3), ['/specialists', dict.nav.specialists] as const, ...nav.slice(3)]

  const switchTo = (l: Locale) => pathname.replace(/^\/(ru|ky)(?=\/|$)/, `/${l}`)
  const isActive = (href: string) => pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container site-header__inner">
        <Link href={`/${locale}`} className="site-logo" aria-label={companyName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={companyName} width={100} height={50} />
        </Link>

        <nav className="site-nav" aria-label={dict.menu}>
          {nav.map(([href, label]) => (
            <Link key={href} href={`/${locale}${href}`} className={isActive(href) ? 'is-active' : ''}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          {showLangSwitch && (
            <div className="lang-switch" aria-label="Язык / Тил">
              {(['ru', 'ky'] as Locale[]).map((l) => (
                <Link key={l} href={switchTo(l)} className={l === locale ? 'is-active' : ''} hrefLang={l} lang={l}>
                  {l === 'ru' ? 'RU' : 'KG'}
                </Link>
              ))}
            </div>
          )}
          {phone && telHref && (
            <a className="header-phone" href={telHref} aria-label={`${dict.cta.call}: ${phone}`}>
              <PhoneIcon size={18} />
              <span>{phone}</span>
            </a>
          )}
          <a className="btn btn--primary btn--sm header-cta" href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={16} /> {dict.cta.consult}
          </a>
          <button
            type="button"
            className="burger"
            aria-label={open ? dict.close : dict.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="mobile-menu" id="mobile-menu" hidden={!open}>
        <nav aria-label={dict.menu}>
          {mobileNav.map(([href, label]) => (
            <Link key={href} href={`/${locale}${href}`} onClick={() => setOpenOn(null)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          {phone && telHref && (
            <a className="btn btn--ghost btn--lg" href={telHref}>
              <PhoneIcon size={18} /> {phone}
            </a>
          )}
          <a className="btn btn--primary btn--lg" href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} /> {dict.cta.whatsapp}
          </a>
        </div>
      </div>
    </header>
  )
}
