'use client'

import React, { useCallback, useEffect, useState } from 'react'
import type { Media } from '@/payload-types'
import { Img } from './Img'

type Item = { id?: string | null; image: Media | number; kind?: string | null; caption?: string | null }

export function Gallery({ items, kinds, allLabel }: { items: Item[]; kinds: Record<string, string>; allLabel: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const valid = items.filter((i) => typeof i.image === 'object')
  const usedKinds = Array.from(new Set(valid.map((i) => i.kind || 'photo')))
  const [kind, setKind] = useState<string>('all')
  const shown = valid.filter((i) => kind === 'all' || (i.kind || 'photo') === kind)

  const close = useCallback(() => setOpen(null), [])
  useEffect(() => {
    if (open === null) return
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % shown.length))
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + shown.length) % shown.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open, shown.length, close])

  if (!valid.length) return null
  const current = open !== null ? shown[open] : null

  return (
    <>
      {usedKinds.length > 1 && (
        <div className="chips gallery-chips">
          <button type="button" className={kind === 'all' ? 'chip is-active' : 'chip'} onClick={() => setKind('all')}>
            {allLabel}
          </button>
          {usedKinds.map((k) => (
            <button type="button" key={k} className={kind === k ? 'chip is-active' : 'chip'} onClick={() => setKind(k)}>
              {kinds[k] || k}
            </button>
          ))}
        </div>
      )}
      <div className="gallery">
        {shown.map((item, i) => (
          <button type="button" key={item.id || i} className="gallery__item" onClick={() => setOpen(i)} aria-label={item.caption || kinds[item.kind || 'photo']}>
            <Img media={item.image} sizes="(max-width: 700px) 50vw, 33vw" />
            {item.caption && <span className="gallery__caption">{item.caption}</span>}
          </button>
        ))}
      </div>
      {current && typeof current.image === 'object' && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button type="button" className="lightbox__close" aria-label="Close" onClick={close}>
            ×
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Prev"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => (o === null ? o : (o - 1 + shown.length) % shown.length))
            }}
          >
            ‹
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.image.sizes?.large?.url || current.image.url || ''} alt={current.image.alt || ''} />
            {(current.caption || current.kind) && (
              <figcaption>
                {kinds[current.kind || 'photo']}
                {current.caption ? ` — ${current.caption}` : ''}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => (o === null ? o : (o + 1) % shown.length))
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
