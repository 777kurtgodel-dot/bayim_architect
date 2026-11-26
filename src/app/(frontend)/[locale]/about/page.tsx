import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero, RichText, SectionHead } from '@/components/site/Blocks'
import { Img } from '@/components/site/Img'
import { SpecialistsSection } from '@/components/site/Specialists'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getGlobal, getServices, getSettings, getTeam } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const page = await getGlobal('about-page', locale)
  return buildMetadata({
    locale,
    path: '/about',
    title: page.title,
    description: page.lead,
    image: page.image,
    meta: page.meta,
    settings: await getSettings(locale),
  })
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services, page, team] = await Promise.all([
    getSettings(locale),
    getServices(locale),
    getGlobal('about-page', locale),
    getTeam(locale),
  ])
  const hasImage = page.image && typeof page.image === 'object'
  return (
    <>
      <PageHero eyebrow={dict.nav.about} title={page.title || dict.nav.about} lead={page.lead} />

      <section className="section section--tight">
        <div className={hasImage ? 'container about-intro' : 'container container--narrow'}>
          <div>
            <RichText data={page.content} />
          </div>
          {hasImage && (
            <div className="about-intro__media marks">
              <Img media={page.image} sizes="(max-width: 1000px) 100vw, 45vw" />
            </div>
          )}
        </div>
      </section>

      <SpecialistsSection
        people={team}
        dict={dict}
        locale={locale}
        title={page.teamTitle || dict.specialists.title}
        lead={page.teamText}
        tone="paper"
      />

      {page.competences && page.competences.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={dict.about.competences} />
            <div className="competences">
              {page.competences.map((c) => (
                <div key={c.id} className="competence">
                  <h3>{c.title}</h3>
                  {c.text && <p>{c.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        title={dict.cta.consult}
        dict={dict}
        locale={locale}
        services={services}
        formType="about"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
