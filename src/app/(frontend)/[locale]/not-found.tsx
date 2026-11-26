'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { getDictionary, isLocale } from '@/lib/i18n'

export default function NotFound() {
  const seg = (usePathname() || '').split('/')[1] || 'ru'
  const locale = isLocale(seg) ? seg : 'ru'
  const dict = getDictionary(locale)
  return (
    <section className="not-found">
      <div className="container">
        <span className="not-found__code">404</span>
        <h1>{dict.notFound.title}</h1>
        <p>{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="btn btn--primary btn--lg">
          {dict.notFound.home}
        </Link>
      </div>
    </section>
  )
}
