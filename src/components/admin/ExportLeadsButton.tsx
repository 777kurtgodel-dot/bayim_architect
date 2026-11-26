'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

/** Кнопка над списком заявок: выгружает текущий отфильтрованный список в Excel (CSV) */
export const ExportLeadsButton = () => {
  const params = useSearchParams()
  const where = new URLSearchParams()
  params?.forEach((value, key) => {
    if (key.startsWith('where')) where.append(key, value)
  })
  const qs = where.toString()
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 12px' }}>
      <a
        href={`/api/leads/export-csv${qs ? `?${qs}` : ''}`}
        className="btn btn--style-secondary btn--size-small"
        style={{ textDecoration: 'none', margin: 0 }}
      >
        ⬇ Выгрузить в Excel (CSV){qs ? ' — по фильтру' : ''}
      </a>
    </div>
  )
}
