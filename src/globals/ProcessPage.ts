import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { seoTab } from '../fields/seo'
import { revalidateGlobal } from '../hooks/revalidate'

export const ProcessPage: GlobalConfig = {
  slug: 'process-page',
  label: 'Страница: Этапы работы',
  admin: { group: 'Контент', description: 'Этапы также показываются на главной странице.' },
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
            {
              name: 'steps',
              label: 'Этапы',
              type: 'array',
              labels: { singular: 'Этап', plural: 'Этапы' },
              fields: [
                { name: 'title', label: 'Название этапа', type: 'text', required: true, localized: true },
                { name: 'text', label: 'Что происходит', type: 'textarea', localized: true },
                { name: 'result', label: 'Результат этапа', type: 'text', localized: true },
              ],
            },
            { name: 'note', label: 'Примечание внизу страницы', type: 'textarea', localized: true },
          ],
        },
        seoTab,
      ],
    },
  ],
}
