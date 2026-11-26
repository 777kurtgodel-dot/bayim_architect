import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero } from '@/components/site/Blocks'
import { SpecialistsGrid } from '@/components/site/Specialists'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getServices, getSettings, getTeam } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({
    locale,
    path: '/specialists',
    title: dict.specialists.title,
    description: dict.specialists.lead,
    settings: await getSettings(locale),
  })
}

export default async function SpecialistsPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services, team] = await Promise.all([getSettings(locale), getServices(locale), getTeam(locale)])
  return (
    <>
      <PageHero eyebrow={settings.companyName || dict.nav.about} title={dict.specialists.title} lead={dict.specialists.lead} />
      <section className="section section--tight">
        <div className="container">
          {team.length > 0 ? (
            <SpecialistsGrid people={team} dict={dict} full />
          ) : (
            <p className="muted">{dict.specialists.empty}</p>
          )}
        </div>
      </section>
      <CtaSection
        title={dict.specialists.cta}
        dict={dict}
        locale={locale}
        services={services}
        formType="specialists"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
