import React from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'
import type { Team } from '@/payload-types'
import { SectionHead } from './Blocks'
import { Img } from './Img'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** «За что отвечает» хранится текстом: каждый пункт с новой строки (маркеры в начале строки убираем) */
const lines = (text?: string | null) =>
  (text || '')
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•·*–—-]+/, '').trim())
    .filter(Boolean)

export const SpecialistCard = ({ person, dict, full }: { person: Team; dict: Dictionary; full?: boolean }) => {
  const duties = lines(person.responsibilities)
  return (
    <article className={`spec-card ${full ? 'spec-card--full' : ''}`}>
      <div className="spec-card__photo">
        {person.photo && typeof person.photo === 'object' ? (
          <Img
            media={person.photo}
            alt={`${person.name} — ${person.position}`}
            sizes={full ? '(max-width: 640px) 34vw, (max-width: 1000px) 50vw, 33vw' : '(max-width: 1000px) 50vw, 25vw'}
          />
        ) : (
          <div className="spec-card__initials" aria-hidden>
            {initials(person.name)}
          </div>
        )}
      </div>
      <div className="spec-card__head">
        <h3>{person.name}</h3>
        <p className="spec-card__pos">{person.position}</p>
        {person.experience && <p className="spec-card__exp">{person.experience}</p>}
      </div>
      {duties.length > 0 && (
        <div className="spec-card__duties">
          <p className="spec-card__label">{dict.specialists.responsible}</p>
          <ul>
            {duties.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {full && person.bio && <p className="spec-card__bio">{person.bio}</p>}
    </article>
  )
}

export const SpecialistsGrid = ({ people, dict, full }: { people: Team[]; dict: Dictionary; full?: boolean }) => (
  <div className={`spec-grid ${full ? 'spec-grid--full' : ''}`}>
    {people.map((p) => (
      <SpecialistCard key={p.id} person={p} dict={dict} full={full} />
    ))}
  </div>
)

/** Блок для главной и страницы «О компании»: первые четыре специалиста и ссылка на всех */
export const SpecialistsSection = ({
  people,
  dict,
  locale,
  title,
  lead,
  eyebrow,
  tone,
}: {
  people: Team[]
  dict: Dictionary
  locale: Locale
  title: string
  lead?: string | null
  eyebrow?: string
  tone?: 'green' | 'paper'
}) => {
  if (people.length === 0) return null
  return (
    <section className={`section ${tone ? `section--${tone}` : ''}`} id="specialists">
      <div className="container">
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          link={{ href: `/${locale}/specialists`, label: dict.cta.allSpecialists }}
        />
        <SpecialistsGrid people={people.slice(0, 4)} dict={dict} />
      </div>
    </section>
  )
}
