import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, FaqList, ProjectCard, SectionHead, ServiceCard, Steps, Testimonials } from '@/components/site/Blocks'
import { WhatsAppIcon } from '@/components/site/Icons'
import { Img } from '@/components/site/Img'
import { SpecialistsSection } from '@/components/site/Specialists'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getFaq, getGlobal, getProjects, getServices, getSettings, getTeam, getTestimonials } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const [settings, home] = await Promise.all([getSettings(locale), getGlobal('home-page', locale)])
  return buildMetadata({
    locale,
    path: '',
    meta: home.meta,
    settings,
    description: settings.defaultSeo?.description,
    image: home.hero?.images?.[0],
  })
}

export default async function HomePage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, home, services, projects, process, testimonials, faq, team] = await Promise.all([
    getSettings(locale),
    getGlobal('home-page', locale),
    getServices(locale),
    getProjects(locale),
    getGlobal('process-page', locale),
    getTestimonials(locale),
    getFaq(locale, true),
    getTeam(locale),
  ])
  const show = home.sections || {}
  const featured = projects.filter((p) => p.featured)
  const showcase = (featured.length >= 3 ? featured : [...featured, ...projects.filter((p) => !p.featured)]).slice(0, 5)
  const homeServices = services.filter((s) => s.showOnHome !== false)
  const wa = whatsappHref(settings, locale === 'ky' ? 'Саламатсызбы! Долбоорду талкуулагым келет.' : 'Здравствуйте! Хочу обсудить проект.')
  const heroImages = (home.hero?.images || []).filter((m) => typeof m === 'object')
  const [mainImage, smallImage] = heroImages

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            {home.hero?.eyebrow && <p className="eyebrow">{home.hero.eyebrow}</p>}
            <h1 className="hero__title">{home.hero?.title}</h1>
            {home.hero?.subtitle && <p className="hero__subtitle">{home.hero.subtitle}</p>}
            <div className="hero__actions">
              <a href={wa} className="btn btn--primary btn--lg" target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> {dict.cta.discuss}
              </a>
              <a href="#request" className="btn btn--ghost btn--lg">
                {dict.cta.consult}
              </a>
            </div>
            {home.hero?.badges && home.hero.badges.length > 0 && (
              <ul className="hero__badges">
                {home.hero.badges.map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="hero__media">
            <div className={`hero__collage ${smallImage ? '' : 'hero__collage--1'}`}>
              <div className="hero__img hero__img--main marks">
                <Img media={mainImage} priority sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
              {smallImage && (
                <div className="hero__img hero__img--small">
                  <Img media={smallImage} sizes="(max-width: 900px) 50vw, 22vw" />
                </div>
              )}
            </div>
            {settings.regions && (
              <div className="hero__region">
                <span>{dict.home.regions}</span>
                <b>{settings.regions}</b>
              </div>
            )}
          </div>
        </div>
      </section>

      {home.stats && home.stats.length > 0 && (
        <section className="stats">
          <div className="container stats__grid">
            {home.stats.map((s) => (
              <div key={s.id} className="stat">
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {show.services !== false && homeServices.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow={dict.nav.services}
              title={dict.home.services}
              lead={dict.home.servicesLead}
              link={{ href: `/${locale}/services`, label: dict.cta.allServices }}
            />
            <div className="services-grid">
              {homeServices.map((s, i) => (
                <ServiceCard key={s.id} service={s} locale={locale} dict={dict} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {show.projects !== false && showcase.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <SectionHead
              eyebrow={dict.nav.projects}
              title={dict.home.projects}
              lead={dict.home.projectsLead}
              link={{ href: `/${locale}/projects`, label: dict.cta.allProjects }}
            />
            {showcase.length >= 5 ? (
              <div className="showcase">
                {showcase.map((p, i) => (
                  <ProjectCard key={p.id} project={p} locale={locale} dict={dict} large={i === 0} />
                ))}
              </div>
            ) : (
              <div className="projects-grid">
                {showcase.map((p) => (
                  <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {show.specialists !== false && (
        <SpecialistsSection
          people={team}
          dict={dict}
          locale={locale}
          eyebrow={dict.nav.specialists}
          title={home.specialistsTitle || dict.home.specialists}
          lead={home.specialistsText}
          tone="green"
        />
      )}

      {show.process !== false && process.steps && process.steps.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead
              eyebrow={dict.nav.process}
              title={dict.home.process}
              lead={process.lead}
              link={{ href: `/${locale}/process`, label: dict.cta.more }}
            />
            <Steps steps={process.steps} />
          </div>
        </section>
      )}

      {show.testimonials !== false && testimonials.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <SectionHead title={dict.home.testimonials} />
            <Testimonials items={testimonials} />
          </div>
        </section>
      )}

      {show.faq !== false && faq.length > 0 && (
        <section className="section">
          <div className="container container--narrow">
            <SectionHead title={dict.home.faq} link={{ href: `/${locale}/faq`, label: dict.cta.allFaq }} />
            <FaqList items={faq} />
          </div>
        </section>
      )}

      <CtaSection
        title={home.ctaTitle || dict.cta.consult}
        text={home.ctaText}
        dict={dict}
        locale={locale}
        services={services}
        formType="home"
        whatsappHref={wa}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
