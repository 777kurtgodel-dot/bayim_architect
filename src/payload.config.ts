import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Faq } from './collections/Faq'
import { LeadFiles } from './collections/LeadFiles'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { ProjectTypes } from './collections/ProjectTypes'
import { Services } from './collections/Services'
import { Team } from './collections/Team'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { ProcessPage } from './globals/ProcessPage'
import { SiteSettings } from './globals/SiteSettings'
import { SERVER_URL } from './lib/serverUrl'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = SERVER_URL

const pagePath: Record<string, string> = {
  services: '/services/',
  projects: '/projects/',
}
const globalPath: Record<string, string> = {
  'home-page': '',
  'about-page': '/about',
  'process-page': '/process',
}

const plugins: Plugin[] = [
  // Поля SEO добавлены вручную вкладкой «SEO» (fields/seo.ts); плагин даёт кнопки автозаполнения и превью
  seoPlugin({
    generateTitle: ({ doc }) => (doc?.title ? `${doc.title} — Байым` : 'Байым — архитектура и строительство'),
    generateDescription: ({ doc }) => doc?.excerpt || doc?.lead || doc?.intro || '',
    generateURL: ({ doc, collectionSlug, globalSlug, locale }) => {
      const l = locale || 'ru'
      if (collectionSlug && pagePath[collectionSlug]) return `${serverURL}/${l}${pagePath[collectionSlug]}${doc?.slug || ''}`
      if (globalSlug && globalSlug in globalPath) return `${serverURL}/${l}${globalPath[globalSlug]}`
      return `${serverURL}/${l}`
    },
  }),
]

// Хранение файлов в S3-совместимом облаке (Cloudflare R2, Backblaze B2 и т.п.).
// Если переменные не заданы — файлы лежат на диске сервера (папки media/ и private/).
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: {
        media: { prefix: 'media' },
        'lead-files': { prefix: 'lead-files', signedDownloads: { shouldUseSignedURL: () => true } },
      },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    // Аватар без Gravatar: не передаём почту сотрудников стороннему сервису
    avatar: 'default',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Байым',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo#AdminLogo',
        Icon: '/components/admin/AdminIcon#AdminIcon',
      },
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
    },
    dateFormat: 'dd.MM.yyyy HH:mm',
  },
  // Интерфейс админки — на русском
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
    // В списках админки галочки показываются словами: «да/нет» вместо стандартных «правда/ложь»
    translations: { ru: { general: { true: 'Да', false: 'Нет' } } },
  },
  // Языки контента сайта
  localization: {
    locales: [
      { code: 'ru', label: 'Русский' },
      { code: 'ky', label: 'Кыргызча' },
    ],
    defaultLocale: 'ru',
    fallback: true,
  },
  collections: [Leads, LeadFiles, Projects, Services, Team, Testimonials, Faq, ProjectTypes, Media, Users],
  globals: [HomePage, AboutPage, ProcessPage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // В разработке схема БД синхронизируется автоматически,
    // в продакшене — миграциями из src/migrations, которые применяются при запуске сервера.
    push: process.env.NODE_ENV !== 'production',
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com',
        defaultFromName: 'Сайт Байым',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  plugins,
  upload: { limits: { fileSize: 25_000_000 } },
  graphQL: { disable: true },
})
