import type { Metadata } from 'next'
import React from 'react'
import { PageHero, PostCard } from '@/components/site/Blocks'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getPosts, getSettings } from '@/lib/payload'
import { buildMetadata } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({ locale, path: '/news', title: dict.news.title, settings: await getSettings(locale) })
}

export default async function NewsPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const posts = await getPosts(locale, 60)
  return (
    <>
      <PageHero eyebrow={dict.nav.news} title={dict.news.title} />
      <section className="section section--tight">
        <div className="container">
          {posts.length === 0 ? (
            <p className="empty">{dict.news.empty}</p>
          ) : (
            <div className="posts-grid">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
