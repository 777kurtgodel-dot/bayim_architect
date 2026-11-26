import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import { authenticated } from '../access'
import { labelOf, leadStatuses, projectStages } from '../lib/leadOptions'
import { notifyAboutLead } from '../lib/notify'

/** Выгрузка заявок в CSV, который корректно открывается в Excel (UTF-8 с BOM, разделитель «;») */
async function exportCsv(req: PayloadRequest) {
  if (!req.user) {
    return Response.json({ error: 'Нужно войти в админку' }, { status: 403 })
  }
  const where = (req.query?.where as Where) || undefined
  const { docs } = await req.payload.find({
    collection: 'leads',
    where,
    depth: 1,
    limit: 10000,
    sort: '-createdAt',
    req,
    overrideAccess: false,
  })
  const header = [
    'Дата',
    'Статус',
    'Имя',
    'Телефон',
    'Email',
    'Услуга',
    'Регион',
    'Стадия',
    'Описание задачи',
    'Файлов',
    'Ответственный',
    'Заметки',
    'Форма',
    'utm_source',
    'utm_campaign',
  ]
  const cell = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = docs.map((l) => [
    new Date(l.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' }),
    labelOf(leadStatuses, l.status),
    l.name,
    l.phone,
    l.email,
    typeof l.service === 'object' && l.service ? l.service.title : '',
    l.region,
    labelOf(projectStages, l.stage),
    l.message,
    Array.isArray(l.files) ? l.files.length : 0,
    typeof l.assignee === 'object' && l.assignee ? l.assignee.name : '',
    l.notes,
    l.meta?.formType,
    l.meta?.utmSource,
    l.meta?.utmCampaign,
  ])
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="baiym-zayavki-${date}.csv"`,
    },
  })
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'name',
    group: 'Заявки',
    defaultColumns: ['createdAt', 'name', 'phone', 'service', 'status', 'region'],
    listSearchableFields: ['name', 'phone', 'email', 'message', 'region'],
    description: 'Обращения с сайта. Меняйте статус по мере работы — на главной странице админки видна воронка.',
    components: {
      beforeListTable: ['/components/admin/ExportLeadsButton#ExportLeadsButton'],
    },
    pagination: { defaultLimit: 25 },
  },
  defaultSort: '-createdAt',
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  endpoints: [{ path: '/export-csv', method: 'get', handler: exportCsv }],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create' && !req.context?.skipNotify) {
          try {
            await notifyAboutLead(req.payload, doc)
          } catch (err) {
            // Ошибка уведомления не должна терять заявку — она уже сохранена в базе
            req.payload.logger.error({ err }, 'Не удалось отправить уведомление о заявке')
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Статус',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: leadStatuses,
          admin: { width: '50%' },
        },
        {
          name: 'assignee',
          label: 'Ответственный',
          type: 'relationship',
          relationTo: 'users',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Имя', type: 'text', required: true },
        { name: 'phone', label: 'Телефон / WhatsApp', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'service', label: 'Услуга', type: 'relationship', relationTo: 'services' },
        { name: 'region', label: 'Регион / населённый пункт', type: 'text' },
        { name: 'stage', label: 'Стадия проекта', type: 'select', options: projectStages },
      ],
    },
    { name: 'message', label: 'Описание задачи', type: 'textarea' },
    {
      name: 'files',
      label: 'Приложенные файлы',
      type: 'upload',
      relationTo: 'lead-files',
      hasMany: true,
    },
    {
      name: 'notes',
      label: 'Заметки менеджера',
      type: 'textarea',
      admin: { description: 'Видны только сотрудникам: договорённости, суммы, дата следующего звонка' },
    },
    {
      name: 'meta',
      label: 'Откуда пришла заявка',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'formType', label: 'Форма', type: 'text', admin: { readOnly: true } },
        { name: 'page', label: 'Страница', type: 'text', admin: { readOnly: true } },
        { name: 'locale', label: 'Язык сайта', type: 'text', admin: { readOnly: true } },
        { name: 'utmSource', label: 'Источник рекламы (utm_source)', type: 'text', admin: { readOnly: true } },
        { name: 'utmMedium', label: 'utm_medium', type: 'text', admin: { readOnly: true } },
        { name: 'utmCampaign', label: 'Кампания (utm_campaign)', type: 'text', admin: { readOnly: true } },
        { name: 'referrer', label: 'Пришёл с сайта', type: 'text', admin: { readOnly: true } },
        { name: 'ip', label: 'IP-адрес', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'consent',
      label: 'Согласие на обработку данных получено',
      type: 'checkbox',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}

