import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero, RichText, SectionHead } from '@/components/site/Blocks'
import { Img } from '@/components/site/Img'
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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default async function AboutPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services, page, team, home] = await Promise.all([
    getSettings(locale),
    getServices(locale),
    getGlobal('about-page', locale),
    getTeam(locale),
    getGlobal('home-page', locale),
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

      {home.principles && home.principles.length > 0 && (
        <section className="section section--green">
          <div className="container">
            <SectionHead eyebrow={dict.home.principles} title={home.principlesTitle || dict.home.principles} />
            <div className="principles">
              {home.principles.map((p, i) => (
                <div key={p.id} className="principle">
                  <span className="principle__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.title}</h3>
                  {p.text && <p>{p.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {team.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <SectionHead title={page.teamTitle || dict.about.team} lead={page.teamText} />
            <div className="team-grid">
              {team.map((m) => (
                <article key={m.id} className="team-card">
                  <div className="team-card__photo">
                    {m.photo && typeof m.photo === 'object' ? (
                      <Img media={m.photo} sizes="(max-width: 700px) 50vw, 25vw" />
                    ) : (
                      <div className="team-card__initials" aria-hidden>
                        {initials(m.name)}
                      </div>
                    )}
                  </div>
                  <h3>{m.name}</h3>
                  <p className="team-card__pos">{m.position}</p>
                  {m.experience && <p className="team-card__exp">{m.experience}</p>}
                  {m.bio && <p className="muted small">{m.bio}</p>}
                </article>
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
