'use client'

import Link from 'next/link'
import React, { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitLead, type LeadState } from '@/lib/leadAction'
import type { Dictionary, Locale } from '@/lib/i18n'
import { WhatsAppIcon } from './Icons'

type Props = {
  dict: Dictionary
  locale: Locale
  services: { id: number; title: string }[]
  defaultService?: number
  allowFiles?: boolean
  formType?: string
  submitLabel?: string
  whatsappHref?: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    ym?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const MAX_FILES = 5
const MAX_SIZE = 15 * 1024 * 1024

export function LeadForm({ dict, locale, services, defaultService, allowFiles = true, formType = 'general', submitLabel, whatsappHref }: Props) {
  const [state, dispatch, pending] = useActionState<LeadState, FormData>(submitLead, null)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [fileError, setFileError] = useState('')
  const startedAt = useRef(0)
  const tracked = useRef(false)
  const f = dict.form

  useEffect(() => {
    startedAt.current = Date.now()
    // Запоминаем UTM-метки рекламы на время визита
    try {
      const params = new URLSearchParams(window.location.search)
      for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) {
        const v = params.get(k)
        if (v) sessionStorage.setItem(k, v)
      }
      if (!sessionStorage.getItem('first_referrer')) sessionStorage.setItem('first_referrer', document.referrer || '-')
    } catch {
      /* sessionStorage может быть недоступен */
    }
  }, [])

  useEffect(() => {
    if (state?.ok && !tracked.current) {
      tracked.current = true
      window.gtag?.('event', 'generate_lead', { form_type: formType })
      window.dataLayer?.push({ event: 'lead_submit', form_type: formType })
      window.fbq?.('track', 'Lead')
    }
  }, [state, formType])

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFileNames(files.map((x) => x.name))
    if (files.length > MAX_FILES) setFileError(f.tooManyFiles)
    else if (files.some((x) => x.size > MAX_SIZE)) setFileError(f.fileTooBig)
    else setFileError('')
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (fileError) return
    const fd = new FormData(e.currentTarget)
    const read = (k: string) => {
      try {
        return sessionStorage.getItem(k) || ''
      } catch {
        return ''
      }
    }
    fd.set('started_at', String(startedAt.current))
    fd.set('page', window.location.pathname)
    fd.set('referrer', read('first_referrer') === '-' ? '' : read('first_referrer'))
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign']) fd.set(k, read(k))
    // Отправка через transition не сбрасывает поля формы, если сервер вернул ошибку
    startTransition(() => dispatch(fd))
  }

  if (state?.ok) {
    return (
      <div className="form-success" role="status">
        <div className="form-success__icon" aria-hidden>
          ✓
        </div>
        <h3>{f.successTitle}</h3>
        <p>{f.successText}</p>
        {whatsappHref && (
          <a className="btn btn--whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} /> {dict.cta.whatsapp}
          </a>
        )}
      </div>
    )
  }

  const id = (name: string) => `${formType}-${name}`.replace(/[^\w-]/g, '-')

  return (
    <form onSubmit={onSubmit} className="lead-form" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="form_type" value={formType} />
      <div className="hp" aria-hidden="true">
        <label>
          Website <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor={id('name')}>{f.name} *</label>
          <input id={id('name')} name="name" required autoComplete="name" maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor={id('phone')}>{f.phone} *</label>
          <input id={id('phone')} name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+996 ___ ___ ___" maxLength={40} />
        </div>
        <div className="field">
          <label htmlFor={id('service')}>{f.service}</label>
          <select id={id('service')} name="service" defaultValue={defaultService ? String(defaultService) : ''}>
            <option value="">{f.servicePlaceholder}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id('region')}>{f.region}</label>
          <input id={id('region')} name="region" maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor={id('stage')}>{f.stage}</label>
          <select id={id('stage')} name="stage" defaultValue="">
            <option value="">{f.stagePlaceholder}</option>
            {Object.entries(f.stages).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id('email')}>{f.email}</label>
          <input id={id('email')} name="email" type="email" autoComplete="email" maxLength={120} />
        </div>
        <div className="field field--wide">
          <label htmlFor={id('message')}>{f.message}</label>
          <textarea id={id('message')} name="message" rows={4} maxLength={4000} />
        </div>
        {allowFiles && (
          <div className="field field--wide">
            <label className="file-drop" htmlFor={id('files')}>
              <span className="file-drop__icon" aria-hidden>
                +
              </span>
              <span>
                <b>{f.files}</b>
                <small>{fileNames.length ? fileNames.join(', ') : f.filesHint}</small>
              </span>
            </label>
            <input
              id={id('files')}
              className="visually-hidden"
              type="file"
              name="files"
              multiple
              accept="image/*,.pdf,.dwg,.dxf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx"
              onChange={onFiles}
            />
            {fileError && <p className="form-error">{fileError}</p>}
          </div>
        )}
      </div>

      {state && !state.ok && (
        <p className="form-error" role="alert">
          {state.error === 'required' ? f.required : f.error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary btn--lg" disabled={pending}>
          {pending ? f.sending : submitLabel || f.submit}
        </button>
        <p className="consent">
          {f.consentPrefix}
          <Link href={`/${locale}/privacy`}>{f.consentLink}</Link>
          {f.consentSuffix}
        </p>
      </div>
    </form>
  )
}
