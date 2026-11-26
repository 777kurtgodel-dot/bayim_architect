import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { seoTab } from '../fields/seo'
import { revalidateGlobal } from '../hooks/revalidate'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'Страница: О компании',
  admin: { group: 'Контент', description: 'Сотрудники добавляются в разделе «Команда», принципы — на странице «Главная».' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Содержание',
          fields: [
            { name: 'title', label: 'Заголовок', type: 'text', required: true, localized: true },
            { name: 'lead', label: 'Вступление', type: 'textarea', localized: true },
            { name: 'image', label: 'Изображение', type: 'upload', relationTo: 'media' },
            { name: 'content', label: 'Текст о компании', type: 'richText', localized: true },
            {
              name: 'competences',
              label: 'Компетенции',
              type: 'array',
              labels: { singular: 'Компетенция', plural: 'Компетенции' },
              fields: [
                { name: 'title', label: 'Заголовок', type: 'text', required: true, localized: true },
                { name: 'text', label: 'Текст', type: 'textarea', localized: true },
              ],
            },
            { name: 'teamTitle', label: 'Заголовок блока «Команда»', type: 'text', localized: true },
            { name: 'teamText', label: 'Текст блока «Команда»', type: 'textarea', localized: true },
          ],
        },
        seoTab,
      ],
    },
  ],
}
