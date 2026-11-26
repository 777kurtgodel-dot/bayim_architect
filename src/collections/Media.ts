import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateHooks } from '../hooks/revalidate'

const altFromFilename = (filename?: string | null) =>
  (filename || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медиатека' },
  admin: {
    group: 'Контент',
    description:
      'Фотографии объектов, визуализации, планировки. Загружайте JPG/PNG/WebP до 25 МБ — сайт сам сожмёт их и нарежет нужные размеры. Можно загружать сразу много файлов.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    ...revalidateHooks,
    beforeChange: [
      ({ data }) => {
        // Если описание не заполнено — берём его из имени файла (для SEO лучше заполнить вручную)
        if (!data.alt && data.filename) data.alt = altFromFilename(data.filename)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Описание изображения',
      type: 'text',
      admin: { description: 'Что на фото. Нужно для Google и незрячих посетителей. Например: «Фасад частного дома в Чолпон-Ате»' },
    },
    { name: 'caption', label: 'Подпись (необязательно)', type: 'text', localized: true },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf'],
    focalPoint: true,
    crop: true,
    formatOptions: { format: 'webp', options: { quality: 84 } },
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 480, height: 360, position: 'centre', formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1680, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'jpeg', options: { quality: 82 } } },
    ],
    adminThumbnail: 'thumb',
  },
}
