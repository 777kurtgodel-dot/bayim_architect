import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { CtaSection, RichText, formatDate } from '@/components/site/Blocks'
import { Img } from '@/components/site/Img'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getPost, getServices, getSettings } from '@/lib/payload'
import { SITE_URL, buildMetadata, mediaObj, telHref, whatsappHref } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPost(locale, slug)
  if (!post) return {}
  return buildMetadata({
    locale,
    path: `/news/${slug}`,
    title: post.title,
    description: post.excerpt,
    image: post.cover,
    meta: post.meta,
    settings: await getSettings(locale),
  })
}

export default async function PostPage({ params }: Params) {
  const { locale, slug } = await params
  const dict = getDictionary(locale)
  const [settings, services, post] = await Promise.all([getSettings(locale), getServices(locale), getPost(locale, slug)])
  if (!post) notFound()
  const cover = mediaObj(post.cover)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    image: cover?.url ? [cover.url.startsWith('http') ? cover.url : `${SITE_URL}${cover.url}`] : undefined,
    publisher: { '@type': 'Organization', name: settings.companyName || 'Байым' },
  }
  return (
    <>
      <section className="page-hero">
        <div className="container container--narrow">
          <nav className="breadcrumbs" aria-label="breadcrumbs">
            <Link href={`/${locale}/news`}>{dict.news.title}</Link>
          </nav>
          <h1 className="page-title">{post.title}</h1>
          {post.publishedAt && (
            <p className="article-meta">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
            </p>
          )}
          {post.excerpt && <p className="page-lead">{post.excerpt}</p>}
        </div>
      </section>
      <section className="section section--tight">
        <div className="container container--narrow">
          {cover && (
            <div className="article-cover">
              <Img media={cover} priority sizes="(max-width: 980px) 100vw, 900px" />
            </div>
          )}
          <RichText data={post.content} />
          <p style={{ marginTop: 48 }}>
            <Link href={`/${locale}/news`} className="link-arrow">
              ← {dict.news.back}
            </Link>
          </p>
        </div>
      </section>
      <CtaSection
        title={dict.cta.consult}
        dict={dict}
        locale={locale}
        services={services}
        formType={`news:${post.slug}`}
        whatsappHref={whatsappHref(settings)}
        phone={settings.phone}
        telHref={telHref(settings.phone)}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  )
}
