import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { seoTab } from '../fields/seo'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Страница: Главная',
  admin: { group: 'Контент', description: 'Тексты первого экрана, принципы и блок заявки на главной странице.' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Первый экран',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                { name: 'eyebrow', label: 'Надзаголовок', type: 'text', localized: true },
                { name: 'title', label: 'Заголовок', type: 'textarea', required: true, localized: true },
                { name: 'subtitle', label: 'Подзаголовок', type: 'textarea', localized: true },
                {
                  name: 'images',
                  label: 'Изображения (слайды)',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: { description: 'Лучше всего — 1–4 горизонтальные фотографии или визуализации реальных объектов' },
                },
                {
                  name: 'badges',
                  label: 'Короткие факты под заголовком',
                  type: 'array',
                  maxRows: 4,
                  fields: [{ name: 'text', label: 'Текст', type: 'text', required: true, localized: true }],
                },
              ],
            },
          ],
        },
        {
          label: 'Цифры',
          fields: [
            {
              name: 'stats',
              label: 'Цифры о компании',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Указывайте только подтверждённые факты. Если блок пуст, он скрывается.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', label: 'Число', type: 'text', required: true },
                    { name: 'label', label: 'Подпись', type: 'text', required: true, localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Принципы',
          fields: [
            { name: 'principlesTitle', label: 'Заголовок блока', type: 'text', localized: true },
            {
              name: 'principles',
              label: 'Принципы / преимущества',
              type: 'array',
              fields: [
                { name: 'title', label: 'Заголовок', type: 'text', required: true, localized: true },
                { name: 'text', label: 'Текст', type: 'textarea', localized: true },
              ],
            },
          ],
        },
        {
          label: 'Блок заявки',
          fields: [
            { name: 'ctaTitle', label: 'Заголовок', type: 'text', localized: true },
            { name: 'ctaText', label: 'Текст', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Видимость блоков',
          fields: [
            {
              name: 'sections',
              type: 'group',
              label: false,
              fields: [
                { name: 'services', label: 'Услуги', type: 'checkbox', defaultValue: true },
                { name: 'projects', label: 'Избранные проекты', type: 'checkbox', defaultValue: true },
                { name: 'principles', label: 'Принципы', type: 'checkbox', defaultValue: true },
                { name: 'process', label: 'Этапы работы', type: 'checkbox', defaultValue: true },
                { name: 'testimonials', label: 'Отзывы', type: 'checkbox', defaultValue: true },
                { name: 'faq', label: 'Вопросы и ответы', type: 'checkbox', defaultValue: true },
                { name: 'news', label: 'Новости', type: 'checkbox', defaultValue: true },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
  ],
}
