import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero, Steps } from '@/components/site/Blocks'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getGlobal, getServices, getSettings } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const page = await getGlobal('process-page', locale)
  return buildMetadata({ locale, path: '/process', title: page.title, description: page.lead, meta: page.meta, settings: await getSettings(locale) })
}

export default async function ProcessPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, services, page] = await Promise.all([getSettings(locale), getServices(locale), getGlobal('process-page', locale)])
  return (
    <>
      <PageHero eyebrow={dict.nav.process} title={page.title || dict.nav.process} lead={page.lead} />
      <section className="section section--tight">
        <div className="container container--narrow">
          <Steps steps={page.steps || []} variant="list" />
          {page.note && <p className="note">{page.note}</p>}
        </div>
      </section>
      <CtaSection
        title={dict.cta.discuss}
        dict={dict}
        locale={locale}
        services={services}
        formType="process"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
