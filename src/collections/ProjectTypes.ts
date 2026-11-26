import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField, slugField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  labels: { singular: 'Тип объекта', plural: 'Типы объектов' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'order'],
    description: 'Используются для фильтра в портфолио: частный дом, коммерческий объект, гостевой дом и т.д.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true, localized: true },
    slugField(),
    orderField,
  ],
}
