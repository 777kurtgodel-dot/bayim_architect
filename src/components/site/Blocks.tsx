import Link from 'next/link'
import React from 'react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Dictionary, Locale } from '@/lib/i18n'
import type { Faq, Project, Service, Testimonial } from '@/payload-types'
import { ArrowIcon, PhoneIcon, ServiceIcon, WhatsAppIcon } from './Icons'
import { Img } from './Img'
import { LeadForm } from './LeadForm'

/** Данные проекта, достаточные для карточки (список грузится без галерей) */
export type ProjectCardData = Pick<
  Project,
  'id' | 'title' | 'slug' | 'excerpt' | 'cover' | 'status' | 'projectType' | 'services' | 'location' | 'showLocation' | 'year' | 'featured'
>

export const SectionHead = ({
  eyebrow,
  title,
  lead,
  link,
}: {
  eyebrow?: string
  title: string
  lead?: string | null
  link?: { href: string; label: string }
}) => (
  <div className="section-head">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
    {link && (
      <Link href={link.href} className="link-arrow">
        {link.label} <ArrowIcon />
      </Link>
    )}
  </div>
)

export const PageHero = ({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: string | null
  crumbs?: { href: string; label: string }[]
  children?: React.ReactNode
}) => (
  <section className="page-hero">
    <div className="container">
      {crumbs && crumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="breadcrumbs">
          {crumbs.map((c) => (
            <Link key={c.href} href={c.href}>
              {c.label}
            </Link>
          ))}
        </nav>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
      {children}
    </div>
  </section>
)

export const ServiceCard = ({ service, locale, dict, index }: { service: Service; locale: Locale; dict: Dictionary; index: number }) => (
  <Link href={`/${locale}/services/${service.slug}`} className="service-card">
    <span className="service-card__num">{String(index + 1).padStart(2, '0')}</span>
    <ServiceIcon name={service.icon} className="service-card__icon" />
    <h3>{service.title}</h3>
    <p>{service.excerpt}</p>
    <span className="link-arrow">
      {dict.cta.more} <ArrowIcon />
    </span>
  </Link>
)

export const ProjectCard = ({
  project,
  locale,
  dict,
  large,
  priority,
}: {
  project: ProjectCardData
  locale: Locale
  dict: Dictionary
  large?: boolean
  priority?: boolean
}) => {
  const type = typeof project.projectType === 'object' && project.projectType ? project.projectType.title : null
  const meta = [type, project.showLocation !== false ? project.location : null, project.year].filter(Boolean).join(' · ')
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className={`project-card ${large ? 'project-card--large' : ''}`}>
      <div className="project-card__media">
        <Img
          media={project.cover}
          priority={priority}
          sizes={large ? '(max-width: 640px) 100vw, (max-width: 1000px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw'}
        />
        <span className={`status-badge status-badge--${project.status}`}>{dict.projects.status[project.status]}</span>
      </div>
      <div className="project-card__body">
        {meta && <p className="project-card__meta">{meta}</p>}
        <h3>{project.title}</h3>
        {project.excerpt && <p className="project-card__excerpt">{project.excerpt}</p>}
      </div>
    </Link>
  )
}

export const Steps = ({
  steps,
  variant = 'grid',
}: {
  steps: { title: string; text?: string | null; result?: string | null; id?: string | null }[]
  variant?: 'grid' | 'list'
}) => (
  <ol className={`steps ${variant === 'list' ? 'steps--list' : ''}`}>
    {steps.map((s, i) => (
      <li key={s.id || i} className="step">
        <span className="step__num">{String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>{s.title}</h3>
          {s.text && <p>{s.text}</p>}
          {s.result && <p className="step__result">{s.result}</p>}
        </div>
      </li>
    ))}
  </ol>
)

export const FaqList = ({ items }: { items: Faq[] }) => (
  <div className="faq-list">
    {items.map((f) => (
      <details key={f.id} className="faq-item">
        <summary>
          <span>{f.question}</span>
          <span className="faq-item__toggle" aria-hidden>
            +
          </span>
        </summary>
        <div className="faq-item__answer">
          {f.answer
            .split(/\n+/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </details>
    ))}
  </div>
)

export const Testimonials = ({ items }: { items: Testimonial[] }) => (
  <div className="testimonials">
    {items.map((t) => (
      <figure key={t.id} className="testimonial">
        <blockquote>«{t.text}»</blockquote>
        <figcaption>
          <b>{t.author}</b>
          {t.object && <span>{t.object}</span>}
        </figcaption>
      </figure>
    ))}
  </div>
)

export const CtaSection = ({
  title,
  text,
  dict,
  locale,
  services,
  defaultService,
  allowFiles,
  formType,
  submitLabel,
  whatsappHref,
  phone,
  telHref,
  id = 'request',
}: {
  title: string
  text?: string | null
  dict: Dictionary
  locale: Locale
  services: Pick<Service, 'id' | 'title'>[]
  defaultService?: number
  allowFiles?: boolean
  formType?: string
  submitLabel?: string
  whatsappHref: string
  phone?: string | null
  telHref?: string
  id?: string
}) => (
  <section className="cta-section" id={id}>
    <div className="container cta-section__grid">
      <div className="cta-section__text">
        <p className="eyebrow eyebrow--light">{dict.form.title}</p>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        <div className="cta-contacts">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={22} /> {dict.cta.whatsapp}
          </a>
          {phone && telHref && (
            <a href={telHref}>
              <PhoneIcon size={22} /> {phone}
            </a>
          )}
        </div>
      </div>
      <div className="cta-section__form">
        <LeadForm
          dict={dict}
          locale={locale}
          services={services.map((s) => ({ id: s.id, title: s.title }))}
          defaultService={defaultService}
          allowFiles={allowFiles}
          formType={formType}
          submitLabel={submitLabel}
          whatsappHref={whatsappHref}
        />
      </div>
    </div>
  </section>
)

export const RichText = ({ data, className = 'prose' }: { data?: unknown; className?: string }) => {
  if (!data || typeof data !== 'object' || !('root' in (data as object))) return null
  const root = (data as SerializedEditorState).root
  const hasContent = root?.children?.some((c) => {
    const children = (c as { children?: { text?: string }[] }).children
    return c.type !== 'paragraph' || (children && children.some((t) => t.text?.trim()))
  })
  if (!hasContent) return null
  return <LexicalRichText data={data as SerializedEditorState} className={className} />
}
