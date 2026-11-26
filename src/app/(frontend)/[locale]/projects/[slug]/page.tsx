import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { CtaSection, ProjectCard, RichText } from '@/components/site/Blocks'
import { Gallery } from '@/components/site/Gallery'
import { WhatsAppIcon } from '@/components/site/Icons'
import { Img } from '@/components/site/Img'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getProject, getProjects, getServices, getSettings } from '@/lib/payload'
import { buildMetadata, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const project = await getProject(locale, slug)
  if (!project) return {}
  return buildMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.title,
    description: project.excerpt || project.task,
    image: project.cover,
    meta: project.meta,
    settings: await getSettings(locale),
  })
}

export default async function ProjectPage({ params }: Params) {
  const { locale, slug } = await params
  const dict = getDictionary(locale)
  const [settings, project, projects, services] = await Promise.all([
    getSettings(locale),
    getProject(locale, slug),
    getProjects(locale),
    getServices(locale),
  ])
  if (!project) notFound()
  const t = dict.projects
  const type = typeof project.projectType === 'object' && project.projectType ? project.projectType.title : null
  const projectServices = (project.services || []).filter((s) => typeof s === 'object' && s)
  const facts: [string, string | null | undefined][] = [
    [t.type, type],
    [t.location, project.showLocation !== false ? project.location : null],
    [t.year, project.year],
    [t.area, project.area ? `${project.area} м²` : null],
    [t.floors, project.floors],
    ...(project.facts || []).map((f) => [f.label, f.value] as [string, string]),
  ]
  const others = projects.filter((p) => p.id !== project.id).slice(0, 3)
  const wa = whatsappHref(
    settings,
    `${locale === 'ky' ? 'Саламатсызбы! Ушундай долбоор кызыктырат:' : 'Здравствуйте! Интересует похожий проект:'} ${project.title}`,
  )

  return (
    <>
      <section className="project-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="breadcrumbs">
            <Link href={`/${locale}/projects`}>{t.title}</Link>
          </nav>
          <div className="project-hero__head">
            <h1 className="page-title">{project.title}</h1>
            <span className={`status-badge status-badge--${project.status} status-badge--static`}>{t.status[project.status]}</span>
          </div>
          {project.excerpt && <p className="page-lead">{project.excerpt}</p>}
          <div className="project-hero__media">
            <Img media={project.cover} priority sizes="(max-width: 1340px) 100vw, 1280px" />
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container project-layout">
          <aside className="project-facts">
            <dl>
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              {projectServices.length > 0 && (
                <div>
                  <dt>{t.servicesDone}</dt>
                  <dd>
                    {projectServices.map((s) =>
                      typeof s === 'object' && s ? (
                        <Link key={s.id} href={`/${locale}/services/${s.slug}`} className="tag">
                          {s.shortTitle || s.title}
                        </Link>
                      ) : null,
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <a href={wa} className="btn btn--primary btn--block" target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> {dict.cta.discuss}
            </a>
          </aside>
          <div className="project-story">
            {project.task && (
              <div className="story-block">
                <h2>{t.task}</h2>
                <p>{project.task}</p>
              </div>
            )}
            {project.solution && (
              <div className="story-block">
                <h2>{t.solution}</h2>
                <p>{project.solution}</p>
              </div>
            )}
            {project.scope && project.scope.length > 0 && (
              <div className="story-block">
                <h2>{t.scope}</h2>
                <ul className="check-list">
                  {project.scope.map((s) => (
                    <li key={s.id}>{s.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.result && (
              <div className="story-block">
                <h2>{t.result}</h2>
                <p>{project.result}</p>
              </div>
            )}
            <RichText data={project.content} />
          </div>
        </div>
      </section>

      {project.gallery && project.gallery.length > 0 && (
        <section className="section section--paper">
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 32 }}>
              {t.gallery}
            </h2>
            <Gallery items={project.gallery} kinds={t.kind} allLabel={t.all} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 40 }}>
              {t.more}
            </h2>
            <div className="projects-grid">
              {others.map((p) => (
                <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection
        title={t.similar}
        dict={dict}
        locale={locale}
        services={services}
        formType={`project:${project.slug}`}
        whatsappHref={wa}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
    </>
  )
}
