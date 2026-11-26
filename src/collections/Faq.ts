import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'

export const faqCategories = [
  { label: 'Общие вопросы', value: 'general' },
  { label: 'Проектирование', value: 'design' },
  { label: 'Строительство', value: 'construction' },
  { label: 'Документация', value: 'documents' },
  { label: 'Сроки и сметы', value: 'pricing' },
  { label: 'Первая консультация', value: 'consultation' },
]

export const Faq: CollectionConfig = {
  slug: 'faq',
  labels: { singular: 'Вопрос', plural: 'Вопросы и ответы' },
  admin: {
    useAsTitle: 'question',
    group: 'Контент',
    defaultColumns: ['question', 'category', 'showOnHome', 'order'],
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    { name: 'question', label: 'Вопрос', type: 'text', required: true, localized: true },
    { name: 'answer', label: 'Ответ', type: 'textarea', required: true, localized: true },
    {
      name: 'category',
      label: 'Раздел',
      type: 'select',
      defaultValue: 'general',
      options: faqCategories,
    },
    orderField,
    {
      name: 'showOnHome',
      label: 'Показывать на главной',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
