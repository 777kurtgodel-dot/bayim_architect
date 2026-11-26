import React from 'react'
import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | string | null
  sizes?: string
  className?: string
  priority?: boolean
  alt?: string
}

/** Адаптивная картинка из медиатеки: srcset из размеров, которые нарезает Payload */
export function Img({ media, sizes = '100vw', className, priority, alt }: Props) {
  if (!media || typeof media !== 'object' || !media.url) {
    return <div className={`img-placeholder ${className || ''}`} aria-hidden />
  }
  const s = media.sizes || {}
  // В srcset — только размеры с теми же пропорциями, что и оригинал: превью 480×360 обрезано,
  // и для вертикального портрета браузер показал бы его вместо целого кадра
  const ratio = media.width && media.height ? media.width / media.height : null
  const sameShape = (v: { width?: number | null; height?: number | null }) =>
    !ratio || !v.width || !v.height || Math.abs(v.width / v.height - ratio) / ratio < 0.03
  const variants = [s.thumb, s.card, s.large]
    .filter((v): v is NonNullable<typeof v> => Boolean(v && v.url && v.width && sameShape(v)))
    .map((v) => `${v.url} ${v.width}w`)
  if (media.width && media.url && !media.mimeType?.includes('svg')) variants.push(`${media.url} ${media.width}w`)
  const style: React.CSSProperties | undefined =
    media.focalX != null && media.focalY != null ? { objectPosition: `${media.focalX}% ${media.focalY}%` } : undefined
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={s.card?.url || s.large?.url || media.url}
      srcSet={variants.length > 1 ? variants.join(', ') : undefined}
      sizes={variants.length > 1 ? sizes : undefined}
      alt={alt ?? media.alt ?? ''}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={style}
    />
  )
}
