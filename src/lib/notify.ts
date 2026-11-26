import type { Payload } from 'payload'
import { labelOf, projectStages } from './leadOptions'
import type { Lead } from '../payload-types'
import { SERVER_URL } from './serverUrl'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Уведомляет ответственных о новой заявке:
 *  — письмом (если на сервере настроен SMTP и в «Настройках сайта» указаны адреса);
 *  — в Telegram (если задан TELEGRAM_BOT_TOKEN и chat ID в настройках).
 */
export async function notifyAboutLead(payload: Payload, lead: Lead) {
  if (lead.status === 'spam') return
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })

  let serviceTitle = ''
  if (lead.service) {
    const id = typeof lead.service === 'object' ? lead.service.id : lead.service
    try {
      serviceTitle = (await payload.findByID({ collection: 'services', id, depth: 0 })).title
    } catch {
      /* услуга могла быть удалена */
    }
  }

  const base = SERVER_URL
  const adminUrl = `${base}/admin/collections/leads/${lead.id}`
  const filesCount = Array.isArray(lead.files) ? lead.files.length : 0
  const source = [lead.meta?.utmSource, lead.meta?.utmCampaign].filter(Boolean).join(' / ')
  const lines: [string, string | null | undefined][] = [
    ['Имя', lead.name],
    ['Телефон', lead.phone],
    ['Email', lead.email],
    ['Услуга', serviceTitle],
    ['Регион', lead.region],
    ['Стадия', lead.stage ? labelOf(projectStages, lead.stage) : null],
    ['Задача', lead.message],
    ['Файлы', filesCount ? `${filesCount} шт. (смотрите в админке)` : null],
    ['Внимание', lead.notes],
    ['Реклама', source || null],
    ['Страница', lead.meta?.page],
  ]
  const filled = lines.filter(([, v]) => v)
  const waDigits = (lead.phone || '').replace(/\D/g, '')

  const tasks: Promise<unknown>[] = []

  const emails = (settings.notifications?.emails || '')
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean)
  if (emails.length && process.env.SMTP_HOST) {
    tasks.push(
      payload.sendEmail({
        to: emails,
        subject: `Новая заявка с сайта: ${lead.name}${serviceTitle ? ` — ${serviceTitle}` : ''}`,
        html: `<h2 style="font-family:sans-serif">Новая заявка с сайта</h2>
<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${filled
          .map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escapeHtml(String(v))}</b></td></tr>`)
          .join('')}</table>
<p style="font-family:sans-serif"><a href="${adminUrl}">Открыть заявку в админ-панели</a>${
          waDigits ? ` · <a href="https://wa.me/${waDigits}">Написать в WhatsApp</a>` : ''
        }</p>`,
      }),
    )
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (settings.notifications?.telegramChatId || '')
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
  if (token && chatIds.length) {
    const text =
      `🏠 <b>Новая заявка с сайта</b>\n\n` +
      filled.map(([k, v]) => `<b>${k}:</b> ${escapeHtml(String(v))}`).join('\n') +
      `\n\n<a href="${adminUrl}">Открыть в админке</a>` +
      (waDigits ? ` · <a href="https://wa.me/${waDigits}">WhatsApp</a>` : '')
    for (const chat_id of chatIds) {
      tasks.push(
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
          signal: AbortSignal.timeout(8000),
        }).then(async (r) => {
          if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`)
        }),
      )
    }
  }

  const results = await Promise.allSettled(tasks)
  for (const r of results) {
    if (r.status === 'rejected') payload.logger.error({ err: r.reason }, 'Уведомление о заявке не отправлено')
  }
}
