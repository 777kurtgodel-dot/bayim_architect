'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { getDictionary, isLocale } from '@/lib/i18n'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const seg = (usePathname() || '').split('/')[1] || 'ru'
  const dict = getDictionary(isLocale(seg) ? seg : 'ru')
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <section className="not-found">
      <div className="container">
        <h1>{dict.error.title}</h1>
        <p>{dict.error.text}</p>
        <button type="button" className="btn btn--primary btn--lg" onClick={reset}>
          {dict.error.retry}
        </button>
      </div>
    </section>
  )
}
