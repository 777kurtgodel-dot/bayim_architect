import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'
import { seoTab } from '../fields/seo'
import { previewPath } from '../lib/preview'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Новость', plural: 'Новости' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'publishedAt', '_status'],
    description: 'Новости компании, ход строительства, полезные статьи.',
    preview: (doc, { locale }) => (doc?.slug ? previewPath(`/${locale || 'ru'}/news/${doc.slug}`) : null),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: revalidateHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Новость',
          fields: [
            { name: 'title', label: 'Заголовок', type: 'text', required: true, localized: true },
            { name: 'excerpt', label: 'Анонс (1–2 предложения)', type: 'textarea', localized: true },
            { name: 'cover', label: 'Обложка', type: 'upload', relationTo: 'media' },
            { name: 'content', label: 'Текст', type: 'richText', localized: true },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    {
      name: 'publishedAt',
      label: 'Дата публикации',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
    },
  ],
}
