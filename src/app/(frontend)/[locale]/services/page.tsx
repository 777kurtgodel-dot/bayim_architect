import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero, ServiceCard } from '@/components/site/Blocks'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getServices, getSettings } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({ locale, path: '/services', title: dict.services.title, description: dict.services.lead, settings: await getSettings(locale) })
}

export default async function ServicesPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services] = await Promise.all([getSettings(locale), getServices(locale)])
  return (
    <>
      <PageHero eyebrow={settings.companyName || undefined} title={dict.services.title} lead={dict.services.lead} />
      <section className="section section--tight">
        <div className="container">
          <div className="services-grid">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} locale={locale} dict={dict} index={i} />
            ))}
          </div>
        </div>
      </section>
      <CtaSection
        title={dict.cta.consult}
        dict={dict}
        locale={locale}
        services={services}
        formType="services"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
