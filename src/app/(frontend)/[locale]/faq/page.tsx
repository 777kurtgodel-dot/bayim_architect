import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, FaqList, PageHero } from '@/components/site/Blocks'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getFaq, getServices, getSettings } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({ locale, path: '/faq', title: dict.faq.title, description: dict.faq.lead, settings: await getSettings(locale) })
}

export default async function FaqPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services, faq] = await Promise.all([getSettings(locale), getServices(locale), getFaq(locale)])
  const groups = Object.entries(dict.faq.categories)
    .map(([key, label]) => ({ key, label, items: faq.filter((f) => (f.category || 'general') === key) }))
    .filter((g) => g.items.length)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }

  return (
    <>
      <PageHero eyebrow={dict.nav.faq} title={dict.faq.title} lead={dict.faq.lead} />
      <section className="section section--tight">
        <div className="container container--narrow">
          {groups.map((g) => (
            <div key={g.key} className="faq-group">
              <h2>{g.label}</h2>
              <FaqList items={g.items} />
            </div>
          ))}
        </div>
      </section>
      <CtaSection
        title={dict.faq.notFound}
        dict={dict}
        locale={locale}
        services={services}
        formType="faq"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
      {faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}
    </>
  )
}
