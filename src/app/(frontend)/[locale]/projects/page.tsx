import type { Metadata } from 'next'
import React from 'react'
import { CtaSection, PageHero } from '@/components/site/Blocks'
import { ProjectsGrid } from '@/components/site/ProjectsGrid'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getProjects, getProjectTypes, getServices, getSettings } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({ locale, path: '/projects', title: dict.projects.title, description: dict.projects.lead, settings: await getSettings(locale) })
}

export default async function ProjectsPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const [settings, projects, types, services] = await Promise.all([
    getSettings(locale),
    getProjects(locale),
    getProjectTypes(locale),
    getServices(locale),
  ])
  return (
    <>
      <PageHero eyebrow={settings.companyName || undefined} title={dict.projects.title} lead={dict.projects.lead} />
      <section className="section section--tight">
        <div className="container">
          <ProjectsGrid
            projects={projects}
            types={types.map((t) => ({ id: t.id, title: t.title }))}
            services={services.map((s) => ({ id: s.id, title: s.title, shortTitle: s.shortTitle }))}
            dict={dict}
            locale={locale}
          />
        </div>
      </section>
      <CtaSection
        title={dict.projects.similar}
        dict={dict}
        locale={locale}
        services={services}
        formType="projects"
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
