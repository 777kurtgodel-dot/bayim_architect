import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/** Вкладка «SEO»: заголовок и описание для Google и превью в соцсетях */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  description:
    'Как страница выглядит в поиске Google/Яндекс и при отправке ссылки в WhatsApp/Instagram. Если оставить пустым — возьмётся название и краткое описание.',
  fields: [
    OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaDescriptionField({ hasGenerateFn: true }),
    MetaImageField({ relationTo: 'media' }),
    PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
  ],
}
