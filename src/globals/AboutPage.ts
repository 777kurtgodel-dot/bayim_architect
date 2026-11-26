import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { seoTab } from '../fields/seo'
import { revalidateGlobal } from '../hooks/revalidate'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'Страница: О компании',
  admin: { group: 'Контент', description: 'Карточки специалистов добавляются в разделе «Специалисты». Здесь — тексты страницы «О компании».' },
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
            {
              name: 'teamTitle',
              label: 'Заголовок блока «Специалисты»',
              type: 'text',
              localized: true,
              admin: { description: 'Блок с первыми четырьмя специалистами и ссылкой на страницу «Специалисты».' },
            },
            { name: 'teamText', label: 'Текст блока «Специалисты»', type: 'textarea', localized: true },
          ],
        },
        seoTab,
      ],
    },
  ],
}
