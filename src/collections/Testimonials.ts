import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  admin: {
    useAsTitle: 'author',
    group: 'Контент',
    defaultColumns: ['author', 'object', 'visible', 'order'],
    description: 'Публикуйте только отзывы, на которые клиент дал согласие.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    { name: 'author', label: 'Автор', type: 'text', required: true, localized: true },
    { name: 'object', label: 'Объект / кто это', type: 'text', localized: true },
    { name: 'text', label: 'Текст отзыва', type: 'textarea', required: true, localized: true },
    { name: 'photo', label: 'Фото автора или объекта', type: 'upload', relationTo: 'media' },
    { name: 'project', label: 'Связанный проект', type: 'relationship', relationTo: 'projects' },
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
