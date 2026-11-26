import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Сотрудник', plural: 'Команда' },
  admin: {
    useAsTitle: 'name',
    group: 'Контент',
    defaultColumns: ['name', 'position', 'visible', 'order'],
    description: 'Сотрудники, которые показываются на странице «О компании».',
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    { name: 'name', label: 'Имя и фамилия', type: 'text', required: true, localized: true },
    { name: 'position', label: 'Должность', type: 'text', required: true, localized: true },
    { name: 'photo', label: 'Фото', type: 'upload', relationTo: 'media' },
    { name: 'bio', label: 'Кратко об опыте', type: 'textarea', localized: true },
    {
      name: 'experience',
      label: 'Опыт (например, «12 лет в проектировании»)',
      type: 'text',
      localized: true,
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
