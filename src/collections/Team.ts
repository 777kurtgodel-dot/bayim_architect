import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Специалист', plural: 'Специалисты' },
  admin: {
    useAsTitle: 'name',
    group: 'Контент',
    defaultColumns: ['name', 'position', 'experience', 'visible', 'order'],
    description:
      'Все специалисты показываются на странице «Специалисты». Первые четыре по порядку — ещё на главной и на странице «О компании».',
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    { name: 'name', label: 'Имя и фамилия', type: 'text', required: true, localized: true },
    { name: 'position', label: 'Должность', type: 'text', required: true, localized: true },
    {
      name: 'photo',
      label: 'Фото',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Вертикальный портрет примерно 4:5 (например, 1200×1500 пикселей), лицо в верхней трети кадра.' },
    },
    {
      name: 'responsibilities',
      label: 'За что отвечает',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Каждый пункт с новой строки, лучше 2–4 коротких пункта. На сайте показываются списком.',
        rows: 4,
      },
    },
    {
      name: 'experience',
      label: 'Опыт (например, «12 лет в проектировании»)',
      type: 'text',
      localized: true,
    },
    {
      name: 'bio',
      label: 'Коротко о специалисте',
      type: 'textarea',
      localized: true,
      admin: { description: 'Одно-два предложения. Показывается на странице «Специалисты».' },
    },
    orderField,
    {
      name: 'visible',
      label: 'Показывать на сайте',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
