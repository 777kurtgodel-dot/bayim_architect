import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Адрес сайта берётся при запуске сервера, поэтому файл не кэшируется на этапе сборки
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Картинки проектов отдаются через /api/media/file — их поисковикам индексировать можно
        allow: ['/', '/api/media/file/'],
        disallow: ['/admin', '/api/', '/next/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
