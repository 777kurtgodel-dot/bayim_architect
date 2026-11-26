import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { orderField, slugField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'
import { seoTab } from '../fields/seo'
import { previewPath } from '../lib/preview'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Проект', plural: 'Проекты (портфолио)' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'status', 'projectType', 'featured', '_status', 'updatedAt'],
    description:
      'Портфолио: реализованные и проектируемые объекты. «Сохранить черновик» — проект не виден посетителям, «Опубликовать» — появится на сайте. Кнопка «Предпросмотр» покажет страницу до публикации.',
    preview: (doc, { locale }) => (doc?.slug ? previewPath(`/${locale || 'ru'}/projects/${doc.slug}`) : null),
  },
  defaultSort: 'order',
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
          label: 'Основное',
          fields: [
            { name: 'title', label: 'Название объекта', type: 'text', required: true, localized: true },
            {
              name: 'excerpt',
              label: 'Краткое описание для карточки',
              type: 'textarea',
              localized: true,
            },
            { name: 'cover', label: 'Главное изображение', type: 'upload', relationTo: 'media', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: 'Статус проекта',
                  type: 'select',
                  // Своё имя типа в БД: иначе оно совпадает со служебным статусом черновиков (_status)
                  enumName: 'enum_projects_object_status',
                  required: true,
                  defaultValue: 'completed',
                  options: [
                    { label: 'Реализован', value: 'completed' },
                    { label: 'Строится', value: 'construction' },
                    { label: 'Проектируется', value: 'design' },
                    { label: 'Концепция', value: 'concept' },
                  ],
                },
                {
                  name: 'projectType',
                  label: 'Тип объекта',
                  type: 'relationship',
                  relationTo: 'project-types',
                },
              ],
            },
            {
              name: 'services',
              label: 'Какие услуги оказаны',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Характеристики',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'location', label: 'Местоположение', type: 'text', localized: true },
                {
                  name: 'showLocation',
                  label: 'Показывать местоположение на сайте',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'year', label: 'Год', type: 'text' },
                { name: 'area', label: 'Площадь, м²', type: 'text' },
                { name: 'floors', label: 'Этажность', type: 'text' },
              ],
            },
            {
              name: 'facts',
              label: 'Другие характеристики',
              type: 'array',
              labels: { singular: 'Характеристика', plural: 'Характеристики' },
              admin: { description: 'Например: «Участок — 8 соток», «Конструктив — монолитный каркас»' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Название', type: 'text', required: true, localized: true },
                    { name: 'value', label: 'Значение', type: 'text', required: true, localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Кейс',
          fields: [
            { name: 'task', label: 'Задача клиента', type: 'textarea', localized: true },
            { name: 'solution', label: 'Наше решение', type: 'textarea', localized: true },
            {
              name: 'scope',
              label: 'Состав работ',
              type: 'array',
              labels: { singular: 'Работа', plural: 'Работы' },
              fields: [{ name: 'text', label: 'Текст', type: 'text', required: true, localized: true }],
            },
            { name: 'result', label: 'Результат', type: 'textarea', localized: true },
            { name: 'content', label: 'Подробный рассказ (необязательно)', type: 'richText', localized: true },
          ],
        },
        {
          label: 'Галерея',
          fields: [
            {
              name: 'gallery',
              label: 'Фотографии, визуализации и чертежи',
              type: 'array',
              labels: { singular: 'Изображение', plural: 'Изображения' },
              admin: { description: 'Добавляйте изображения в порядке показа. Можно перетаскивать.' },
              fields: [
                { name: 'image', label: 'Изображение', type: 'upload', relationTo: 'media', required: true },
                {
                  name: 'kind',
                  label: 'Тип',
                  type: 'select',
                  defaultValue: 'photo',
                  options: [
                    { label: 'Фото объекта', value: 'photo' },
                    { label: 'Визуализация', value: 'render' },
                    { label: 'Планировка / чертёж', value: 'plan' },
                    { label: 'Ход строительства', value: 'process' },
                  ],
                },
                { name: 'caption', label: 'Подпись', type: 'text', localized: true },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    orderField,
    {
      name: 'featured',
      label: 'Избранный (показывать на главной)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
