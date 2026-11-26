import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { CtaSection, ProjectCard, RichText, Steps } from '@/components/site/Blocks'
import { ArrowIcon, ServiceIcon, WhatsAppIcon } from '@/components/site/Icons'
import { Img } from '@/components/site/Img'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getProjects, getServices, getSettings } from '@/lib/payload'
import { SITE_URL, buildMetadata, ctaLabel, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const service = (await getServices(locale)).find((s) => s.slug === slug)
  if (!service) return {}
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: service.title,
    description: service.excerpt,
    image: service.cover,
    meta: service.meta,
    settings: await getSettings(locale),
  })
}

const List = ({ title, items, single }: { title: string; items?: { text: string; id?: string | null }[] | null; single?: boolean }) =>
  items && items.length > 0 ? (
    <div className="service-block">
      <h2>{title}</h2>
      <ul className={`check-list ${single ? 'check-list--single' : ''}`}>
        {items.map((i, k) => (
          <li key={i.id || k}>{i.text}</li>
        ))}
      </ul>
    </div>
  ) : null

export default async function ServicePage({ params }: Params) {
  const { locale, slug } = await params
  const dict = getDictionary(locale)
  const [settings, services, projects] = await Promise.all([getSettings(locale), getServices(locale), getProjects(locale)])
  const service = services.find((s) => s.slug === slug)
  if (!service) notFound()

  const related = projects.filter((p) => (p.services || []).some((s) => (typeof s === 'object' ? s.id : s) === service.id)).slice(0, 3)
  const label = ctaLabel(dict, service.ctaType)
  const wa = whatsappHref(settings, `${locale === 'ky' ? 'Саламатсызбы! Кызмат боюнча:' : 'Здравствуйте! Интересует услуга:'} ${service.title}`)
  const others = services.filter((s) => s.id !== service.id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.excerpt,
    provider: { '@type': 'GeneralContractor', name: settings.companyName || 'Байым', url: SITE_URL },
    areaServed: settings.regions || 'Кыргызстан',
    url: `${SITE_URL}/${locale}/services/${service.slug}`,
  }

  return (
    <>
      <section className="service-hero">
        <div className="container service-hero__grid">
          <div>
            <nav className="breadcrumbs" aria-label="breadcrumbs">
              <Link href={`/${locale}/services`}>{dict.services.title}</Link>
            </nav>
            <ServiceIcon name={service.icon} className="service-hero__icon" size={52} />
            <h1 className="page-title">{service.title}</h1>
            <p className="page-lead">{service.intro || service.excerpt}</p>
            <div className="hero__actions">
              <a href="#request" className="btn btn--primary btn--lg">
                {label}
              </a>
              <a href={wa} className="btn btn--whatsapp btn--lg" target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
            </div>
          </div>
          <div className="service-hero__media marks">
            <Img media={service.cover} priority sizes="(max-width: 1000px) 100vw, 45vw" />
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container service-layout">
          <div className="service-main">
            <List title={dict.services.forWhom} items={service.forWhom} single />
            <List title={dict.services.included} items={service.included} />
            {service.steps && service.steps.length > 0 && (
              <div className="service-block">
                <h2>{dict.services.steps}</h2>
                <Steps steps={service.steps} variant="list" />
              </div>
            )}
            <List title={dict.services.inputs} items={service.inputs} />
            <List title={dict.services.results} items={service.results} />
            <RichText data={service.content} />
          </div>
          <aside className="service-aside">
            <div className="aside-card">
              {service.priceNote && (
                <>
                  <h3>{dict.services.price}</h3>
                  <p>{service.priceNote}</p>
                </>
              )}
              <a href="#request" className="btn btn--primary btn--block">
                {label}
              </a>
              <a href={wa} className="btn btn--whatsapp btn--block" target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> {dict.cta.whatsapp}
              </a>
              {service.ctaText && <p className="small muted">{service.ctaText}</p>}
            </div>
            {others.length > 0 && (
              <nav className="aside-links" aria-label={dict.services.other}>
                <h4>{dict.services.other}</h4>
                {others.map((o) => (
                  <Link key={o.id} href={`/${locale}/services/${o.slug}`}>
                    {o.shortTitle || o.title} <ArrowIcon size={14} />
                  </Link>
                ))}
              </nav>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 40 }}>
              {dict.services.related}
            </h2>
            <div className="projects-grid">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        title={label}
        text={service.ctaText}
        dict={dict}
        locale={locale}
        services={services}
        defaultService={service.id}
        allowFiles={service.allowFiles !== false}
        formType={`service:${service.slug}`}
        submitLabel={label}
        whatsappHref={wa}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  )
}
