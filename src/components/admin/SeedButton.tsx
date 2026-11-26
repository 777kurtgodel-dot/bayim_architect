'use client'

import React, { useState } from 'react'

/** Кнопка на главной админки: заполняет пустой сайт демо-контентом из брифа */
export const SeedButton = () => {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const run = async () => {
    if (state === 'loading') return
    setState('loading')
    setMessage('')
    try {
      const res = await fetch('/next/seed', { method: 'POST', credentials: 'include' })
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`)
      setState('done')
      setMessage(data.message || 'Готово')
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Не удалось загрузить демо-контент')
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={run}
        disabled={state === 'loading' || state === 'done'}
        className="btn btn--style-primary btn--size-medium"
        style={{ margin: 0 }}
      >
        {state === 'loading' ? 'Загружаем… это займёт до минуты' : 'Загрузить демо-контент'}
      </button>
      {message && <span style={{ fontSize: 14, color: state === 'error' ? 'var(--theme-error-500)' : 'inherit' }}>{message}</span>}
    </div>
  )
}
