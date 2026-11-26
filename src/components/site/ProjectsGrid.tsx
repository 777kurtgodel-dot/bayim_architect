'use client'

import React, { useMemo, useState } from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'
import type { ProjectType, Service } from '@/payload-types'
import { ProjectCard, type ProjectCardData } from './Blocks'

type Props = {
  projects: ProjectCardData[]
  types: Pick<ProjectType, 'id' | 'title'>[]
  services: Pick<Service, 'id' | 'title' | 'shortTitle'>[]
  dict: Dictionary
  locale: Locale
}

/** Портфолио с фильтром по типу объекта, услуге и статусу (без перезагрузки страницы) */
export function ProjectsGrid({ projects, types, services, dict, locale }: Props) {
  const [type, setType] = useState<number | 'all'>('all')
  const [service, setService] = useState<number | 'all'>('all')
  const [status, setStatus] = useState<string>('all')

  const usedTypes = types.filter((t) => projects.some((p) => (typeof p.projectType === 'object' ? p.projectType?.id : p.projectType) === t.id))
  const usedStatuses = Object.keys(dict.projects.status).filter((s) => projects.some((p) => p.status === s))
  const usedServices = services.filter((s) =>
    projects.some((p) => (p.services || []).some((ps) => (typeof ps === 'object' ? ps.id : ps) === s.id)),
  )

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const pt = typeof p.projectType === 'object' ? p.projectType?.id : p.projectType
        const ps = (p.services || []).map((x) => (typeof x === 'object' ? x.id : x))
        return (type === 'all' || pt === type) && (service === 'all' || ps.includes(service)) && (status === 'all' || p.status === status)
      }),
    [projects, type, service, status],
  )

  return (
    <>
      <div className="filters">
        {usedTypes.length > 0 && (
          <div className="chips" role="group" aria-label={dict.projects.type}>
            <button type="button" aria-pressed={type === 'all'} className={type === 'all' ? 'chip is-active' : 'chip'} onClick={() => setType('all')}>
              {dict.projects.all}
            </button>
            {usedTypes.map((t) => (
              <button type="button" key={t.id} aria-pressed={type === t.id} className={type === t.id ? 'chip is-active' : 'chip'} onClick={() => setType(t.id)}>
                {t.title}
              </button>
            ))}
          </div>
        )}
        <div className="filters__selects">
          {usedServices.length > 1 && (
            <select value={String(service)} onChange={(e) => setService(e.target.value === 'all' ? 'all' : Number(e.target.value))} aria-label={dict.projects.servicesDone}>
              <option value="all">{dict.projects.servicesDone}: {dict.projects.all.toLowerCase()}</option>
              {usedServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortTitle || s.title}
                </option>
              ))}
            </select>
          )}
          {usedStatuses.length > 1 && (
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={dict.projects.statusLabel}>
              <option value="all">{dict.projects.statusLabel}: {dict.projects.all.toLowerCase()}</option>
              {usedStatuses.map((s) => (
                <option key={s} value={s}>
                  {dict.projects.status[s as keyof typeof dict.projects.status]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">{dict.projects.empty}</p>
      ) : (
        <div className="projects-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
          ))}
        </div>
      )}
    </>
  )
}
