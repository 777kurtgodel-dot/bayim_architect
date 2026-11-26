'use server'

import { headers } from 'next/headers'
import { LEAD_FILE_TYPES } from '@/collections/LeadFiles'
import { getPayloadClient } from './payload'

export type LeadState = { ok: boolean; error?: 'required' | 'rate' | 'server' } | null

const MAX_FILES = 5
const MAX_FILE_SIZE = 15 * 1024 * 1024
const STAGES = ['idea', 'land', 'project', 'construction', 'built'] as const

// Ограничение частоты: не больше 5 заявок с одного IP за 10 минут
const hits = new Map<string, number[]>()
const WINDOW = 10 * 60_000
const rateLimited = (ip: string) => {
  const now = Date.now()
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t > WINDOW)) hits.delete(key)
  }
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 5
}

const str = (fd: FormData, key: string, max = 500) => {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

const safeName = (name: string) => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .slice(0, 80)
  return { ext, name: `${base || 'file'}.${ext}` }
}

export async function submitLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown'

  // Защита от спама: скрытое поле-ловушка и слишком быстрая отправка (боты заполняют форму мгновенно)
  const honeypot = str(fd, 'company_website')
  const startedAt = Number(str(fd, 'started_at')) || 0
  const isBot = Boolean(honeypot) || (startedAt > 0 && Date.now() - startedAt < 2500)

  if (rateLimited(ip)) return { ok: false, error: 'rate' }

  const name = str(fd, 'name', 120)
  const phone = str(fd, 'phone', 40)
  if (!name || phone.replace(/\D/g, '').length < 6) return { ok: false, error: 'required' }

  // Боту отвечаем «успехом», чтобы он не пробовал снова
  if (isBot) return { ok: true }

  const payload = await getPayloadClient()

  let serviceId: number | undefined
  const serviceRaw = str(fd, 'service', 20)
  if (/^\d+$/.test(serviceRaw)) {
    const found = await payload.find({
      collection: 'services',
      where: { id: { equals: Number(serviceRaw) } },
      limit: 1,
      depth: 0,
      select: {},
    })
    serviceId = found.docs[0]?.id
  }
  const emailRaw = str(fd, 'email', 120)
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : undefined
  const stageRaw = str(fd, 'stage')
  const stage = (STAGES as readonly string[]).includes(stageRaw) ? (stageRaw as (typeof STAGES)[number]) : undefined

  try {
    const fileIds: number[] = []
    // Файлы, которые не удалось принять, не мешают заявке: она сохраняется, а менеджер видит пометку
    const skipped: string[] = []
    const allFiles = fd
      .getAll('files')
      .filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f && f.size > 0)
    if (allFiles.length > MAX_FILES) skipped.push(`ещё ${allFiles.length - MAX_FILES} шт. сверх лимита в ${MAX_FILES} файлов`)
    for (const file of allFiles.slice(0, MAX_FILES)) {
      const { ext, name: fileName } = safeName(file.name)
      if (file.size > MAX_FILE_SIZE) {
        skipped.push(`${fileName} — больше 15 МБ`)
        continue
      }
      const mimetype = LEAD_FILE_TYPES[ext]
      if (!mimetype) {
        skipped.push(`${fileName} — неподдерживаемый формат`)
        continue
      }
      try {
        const doc = await payload.create({
          collection: 'lead-files',
          data: { note: `${name}, ${phone}` },
          file: { data: Buffer.from(await file.arrayBuffer()), mimetype, name: fileName, size: file.size },
          overrideAccess: true,
        })
        fileIds.push(doc.id)
      } catch (err) {
        skipped.push(`${fileName} — файл повреждён или не открывается`)
        payload.logger.warn({ err }, `Файл заявки не сохранён: ${fileName}`)
      }
    }

    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name,
        phone,
        email,
        service: serviceId,
        region: str(fd, 'region', 200) || undefined,
        stage,
        message: str(fd, 'message', 4000) || undefined,
        files: fileIds,
        notes: skipped.length
          ? `Не все файлы прикрепились: ${skipped.join('; ')}. Попросите клиента прислать их в WhatsApp.`
          : undefined,
        consent: true,
        status: 'new',
        meta: {
          formType: str(fd, 'form_type', 80),
          page: str(fd, 'page', 300),
          locale: str(fd, 'locale', 5),
          utmSource: str(fd, 'utm_source', 120),
          utmMedium: str(fd, 'utm_medium', 120),
          utmCampaign: str(fd, 'utm_campaign', 200),
          referrer: str(fd, 'referrer', 300),
          ip,
        },
      },
    })
    return { ok: true }
  } catch (err) {
    payload.logger.error({ err }, 'Ошибка сохранения заявки')
    return { ok: false, error: 'server' }
  }
}
