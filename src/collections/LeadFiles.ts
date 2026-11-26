import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/** Разрешённые типы файлов, которые посетитель может приложить к заявке */
export const LEAD_FILE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  dwg: 'application/acad',
  dxf: 'application/dxf',
}

/** Файлы, приложенные клиентами к заявкам. Доступны только после входа в админку. */
export const LeadFiles: CollectionConfig = {
  slug: 'lead-files',
  labels: { singular: 'Файл заявки', plural: 'Файлы заявок' },
  admin: {
    group: 'Заявки',
    defaultColumns: ['filename', 'note', 'createdAt'],
    description: 'Планы участков, чертежи и фото, которые клиенты приложили к заявкам. Не видны посетителям сайта.',
  },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  fields: [{ name: 'note', label: 'Комментарий', type: 'text' }],
  upload: {
    staticDir: 'private/lead-files',
    mimeTypes: [...new Set(Object.values(LEAD_FILE_TYPES)), 'application/x-zip-compressed', 'application/octet-stream'],
  },
}
