import type { Payload, TypedUser } from 'payload'
import React from 'react'
import { leadStatuses } from '../../lib/leadOptions'
import { SERVER_URL } from '../../lib/serverUrl'
import { SeedButton } from './SeedButton'

type Props = { payload: Payload; user?: TypedUser | null }

const card: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: 10,
  padding: '18px 20px',
}

const Stat = ({ label, value, href, accent }: { label: string; value: number | string; href?: string; accent?: boolean }) => {
  const inner = (
    <div style={{ ...card, borderLeft: accent ? '4px solid #B8965A' : card.border }}>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{label}</div>
    </div>
  )
  return href ? (
    <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </a>
  ) : (
    inner
  )
}

const knownSources: [RegExp, string][] = [
  [/google/, 'Google'],
  [/yandex|ya\.ru/, 'Яндекс'],
  [/instagram|^ig$/, 'Instagram'],
  [/facebook|^fb$|meta/, 'Facebook'],
  [/2gis/, '2ГИС'],
  [/whatsapp|wa\.me/, 'WhatsApp'],
  [/telegram|t\.me|^tg$/, 'Telegram'],
  [/tiktok/, 'TikTok'],
  [/youtube/, 'YouTube'],
]

const ownHost = (() => {
  try {
    return new URL(SERVER_URL).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})()

/** Откуда пришла заявка: utm_source, иначе сайт-источник перехода, иначе «прямой заход» */
const sourceOf = (meta?: { utmSource?: string | null; referrer?: string | null } | null) => {
  const utm = meta?.utmSource?.trim().toLowerCase()
  let raw = utm || ''
  if (!raw && meta?.referrer) {
    try {
      raw = new URL(meta.referrer).hostname.replace(/^www\./, '')
    } catch {
      raw = ''
    }
    if (raw === ownHost) raw = ''
  }
  if (!raw) return 'Прямой заход / не указан'
  const known = knownSources.find(([re]) => re.test(raw))
  return known ? known[1] : raw
}

const Bars = ({ title, rows, empty }: { title: string; rows: { label: string; count: number }[]; empty: string }) => {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div style={card}>
      <h4 style={{ margin: '0 0 12px' }}>{title}</h4>
      {rows.length === 0 && <p style={{ opacity: 0.6, margin: 0 }}>{empty}</p>}
      {rows.map((r) => (
        <div key={r.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
            <span>{r.label}</span>
            <b>{r.count}</b>
          </div>
          <div style={{ height: 6, background: 'var(--theme-elevation-100)', borderRadius: 3, marginTop: 4 }}>
            <div style={{ width: `${(r.count / max) * 100}%`, height: '100%', borderRadius: 3, background: '#004F42' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const tally = (values: string[]) =>
  Object.entries(
    values.reduce<Record<string, number>>((acc, v) => {
      acc[v] = (acc[v] || 0) + 1
      return acc
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

const fmt = (d: string) =>
  new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bishkek' })

export async function Dashboard({ payload, user }: Props) {
  // Роль в админке одна (администратор), поэтому заявки видит любой вошедший пользователь
  const canSeeLeads = Boolean(user)
  // Серверный компонент: выполняется заново при каждом открытии админки
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const weekAgo = new Date(now - 7 * 864e5).toISOString()
  const monthAgo = new Date(now - 30 * 864e5).toISOString()

  const [projects, services, team, posts, media] = await Promise.all([
    payload.count({ collection: 'projects' }),
    payload.count({ collection: 'services' }),
    payload.count({ collection: 'team' }),
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'media' }),
  ])

  let leadsBlock: React.ReactNode = null
  if (canSeeLeads) {
    const notSpam = { status: { not_equals: 'spam' } }
    const [newLeads, week, month, total, latest, byStatus, monthDocs, serviceList] = await Promise.all([
      payload.count({ collection: 'leads', where: { status: { equals: 'new' } } }),
      payload.count({ collection: 'leads', where: { and: [notSpam, { createdAt: { greater_than: weekAgo } }] } }),
      payload.count({ collection: 'leads', where: { and: [notSpam, { createdAt: { greater_than: monthAgo } }] } }),
      payload.count({ collection: 'leads', where: notSpam }),
      payload.find({ collection: 'leads', limit: 6, sort: '-createdAt', depth: 1, where: notSpam }),
      Promise.all(
        leadStatuses.map(async (s) => ({
          ...s,
          count: (await payload.count({ collection: 'leads', where: { status: { equals: s.value } } })).totalDocs,
        })),
      ),
      payload.find({
        collection: 'leads',
        where: { and: [notSpam, { createdAt: { greater_than: monthAgo } }] },
        depth: 0,
        limit: 2000,
        pagination: false,
        select: { service: true, meta: true },
      }),
      payload.find({ collection: 'services', depth: 0, limit: 100, pagination: false, select: { title: true, shortTitle: true } }),
    ])
    const serviceTitle = new Map(serviceList.docs.map((s) => [s.id, s.shortTitle || s.title]))
    const byService = tally(
      monthDocs.docs.map((l) => {
        const id = typeof l.service === 'object' && l.service ? l.service.id : l.service
        return (id && serviceTitle.get(id)) || 'Услуга не выбрана'
      }),
    )
    const bySource = tally(monthDocs.docs.map((l) => sourceOf(l.meta)))
    const maxStatus = Math.max(1, ...byStatus.map((s) => s.count))
    leadsBlock = (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 18 }}>
          <Stat label="Новые, ждут ответа" value={newLeads.totalDocs} href="/admin/collections/leads?where[status][equals]=new" accent />
          <Stat label="Заявок за 7 дней" value={week.totalDocs} />
          <Stat label="Заявок за 30 дней" value={month.totalDocs} />
          <Stat label="Всего заявок" value={total.totalDocs} href="/admin/collections/leads" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14, marginBottom: 28 }}>
          <div style={card}>
            <h4 style={{ margin: '0 0 12px' }}>Последние заявки</h4>
            {latest.docs.length === 0 && <p style={{ opacity: 0.6, margin: 0 }}>Пока заявок нет.</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <tbody>
                {latest.docs.map((l) => {
                  const st = leadStatuses.find((s) => s.value === l.status)
                  const service = typeof l.service === 'object' && l.service ? l.service.title : ''
                  return (
                    <tr key={l.id} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                      <td style={{ padding: '8px 4px', whiteSpace: 'nowrap', opacity: 0.7 }}>{fmt(l.createdAt)}</td>
                      <td style={{ padding: '8px 4px' }}>
                        <a href={`/admin/collections/leads/${l.id}`}>{l.name}</a>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>{[l.phone, service].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td style={{ padding: '8px 4px', whiteSpace: 'nowrap', fontSize: 13 }}>{st?.label}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={card}>
            <h4 style={{ margin: '0 0 12px' }}>Воронка заявок</h4>
            {byStatus.map((s) => (
              <a
                key={s.value}
                href={`/admin/collections/leads?where[status][equals]=${s.value}`}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 8 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{s.label}</span>
                  <b>{s.count}</b>
                </div>
                <div style={{ height: 6, background: 'var(--theme-elevation-100)', borderRadius: 3, marginTop: 4 }}>
                  <div
                    style={{
                      width: `${(s.count / maxStatus) * 100}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: s.value === 'won' ? '#B8965A' : '#004F42',
                    }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14, marginBottom: 28 }}>
          <Bars title="Какие услуги запрашивают (30 дней)" rows={byService} empty="За 30 дней заявок не было." />
          <Bars title="Откуда приходят заявки (30 дней)" rows={bySource} empty="За 30 дней заявок не было." />
        </div>
      </>
    )
  }

  const isEmptySite = Boolean(user) && services.totalDocs === 0 && projects.totalDocs === 0

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ margin: '0 0 4px' }}>Здравствуйте{user && 'name' in user && user.name ? `, ${user.name}` : ''}!</h2>
      <p style={{ opacity: 0.7, margin: '0 0 20px' }}>
        Здесь можно управлять всем содержимым сайта.{' '}
        <a href="/" target="_blank" rel="noreferrer">
          Открыть сайт ↗
        </a>
      </p>
      {isEmptySite && (
        <div style={{ ...card, borderLeft: '4px solid #B8965A', marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 6px' }}>Сайт пока пустой</h4>
          <p style={{ margin: '0 0 14px', opacity: 0.8, maxWidth: 720 }}>
            Можно загрузить демо-контент из брифа: 6 услуг с описаниями, этапы работы, принципы, вопросы и ответы, 5 демонстрационных
            проектов с чертежами-заглушками, карточки команды и 3 тестовые заявки. Всё демонстрационное помечено словом «Демо» — перед
            запуском замените это реальными материалами.
          </p>
          <SeedButton />
        </div>
      )}
      {leadsBlock}
      <h4 style={{ margin: '0 0 12px' }}>Контент сайта</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 18 }}>
        <Stat label="Проектов в портфолио" value={projects.totalDocs} href="/admin/collections/projects" />
        <Stat label="Услуг" value={services.totalDocs} href="/admin/collections/services" />
        <Stat label="Сотрудников" value={team.totalDocs} href="/admin/collections/team" />
        <Stat label="Новостей" value={posts.totalDocs} href="/admin/collections/posts" />
        <Stat label="Файлов в медиатеке" value={media.totalDocs} href="/admin/collections/media" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[
          ['+ Добавить проект', '/admin/collections/projects/create'],
          ['+ Добавить сотрудника', '/admin/collections/team/create'],
          ['+ Написать новость', '/admin/collections/posts/create'],
          ['Контакты и соцсети', '/admin/globals/site-settings'],
          ['Тексты главной', '/admin/globals/home-page'],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid var(--theme-elevation-150)',
              textDecoration: 'none',
              color: 'inherit',
              fontSize: 14,
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}
