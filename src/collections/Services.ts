import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { orderField, slugField } from '../fields/slug'
import { revalidateHooks } from '../hooks/revalidate'
import { seoTab } from '../fields/seo'
import { previewPath } from '../lib/preview'

const textList = (name: string, label: string, description?: string) => ({
  name,
  label,
  type: 'array' as const,
  admin: { description, initCollapsed: true },
  labels: { singular: 'Пункт', plural: 'Пункты' },
  fields: [{ name: 'text', label: 'Текст', type: 'text' as const, required: true, localized: true }],
})

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Услуга', plural: 'Услуги' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    defaultColumns: ['title', 'ctaType', 'order', 'updatedAt'],
    description: 'Каждая услуга получает свою страницу на сайте с формой заявки.',
    preview: (doc, { locale }) => (doc?.slug ? previewPath(`/${locale || 'ru'}/services/${doc.slug}`) : null),
  },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: revalidateHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', label: 'Название услуги', type: 'text', required: true, localized: true },
            {
              name: 'shortTitle',
              label: 'Короткое название (для меню)',
              type: 'text',
              localized: true,
            },
            {
              name: 'excerpt',
              label: 'Краткое описание (1–2 предложения для карточки)',
              type: 'textarea',
              required: true,
              localized: true,
            },
            {
              name: 'icon',
              label: 'Иконка',
              type: 'select',
              defaultValue: 'blueprint',
              options: [
                { label: 'Чертёж (проектирование)', value: 'blueprint' },
                { label: 'Кран (строительство)', value: 'crane' },
                { label: 'Дом под ключ', value: 'house' },
                { label: 'Документы', value: 'docs' },
                { label: 'Бетон / монолит', value: 'concrete' },
                { label: 'Инженерные сети', value: 'pipes' },
              ],
            },
            { name: 'cover', label: 'Обложка', type: 'upload', relationTo: 'media' },
            {
              name: 'intro',
              label: 'Вступление на странице услуги',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Состав услуги',
          fields: [
            textList('forWhom', 'Для кого эта услуга'),
            textList('included', 'Что входит'),
            {
              name: 'steps',
              label: 'Как проходит работа',
              type: 'array',
              labels: { singular: 'Этап', plural: 'Этапы' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', label: 'Этап', type: 'text', required: true, localized: true },
                { name: 'text', label: 'Описание', type: 'textarea', localized: true },
              ],
            },
            textList('inputs', 'Какие исходные данные нужны'),
            textList('results', 'Что получает заказчик'),
            {
              name: 'priceNote',
              label: 'Стоимость и сроки (текст)',
              type: 'textarea',
              localized: true,
              admin: { description: 'Например: «Стоимость рассчитывается индивидуально после изучения участка»' },
            },
            {
              name: 'content',
              label: 'Дополнительный текст',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Кнопка и форма',
          fields: [
            {
              name: 'ctaType',
              label: 'Призыв к действию',
              type: 'select',
              required: true,
              defaultValue: 'discuss',
              options: [
                { label: '«Обсудить проект»', value: 'discuss' },
                { label: '«Получить первичную оценку»', value: 'estimate' },
                { label: '«Запросить расчёт»', value: 'calculate' },
                { label: '«Получить консультацию»', value: 'consult' },
              ],
            },
            {
              name: 'ctaText',
              label: 'Пояснение под кнопкой',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'allowFiles',
              label: 'Разрешить прикреплять файлы в форме (план участка, чертежи)',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    orderField,
    {
      name: 'showOnHome',
      label: 'Показывать на главной',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
