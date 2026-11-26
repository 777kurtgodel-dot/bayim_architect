import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    // Форма заявки принимает файлы (чертежи, планы участка) — до 5 файлов по 15 МБ
    serverActions: { bodySizeLimit: '80mb' },
  },
  async redirects() {
    return [
      { source: '/', destination: '/ru', permanent: false },
      { source: '/kg', destination: '/ky', permanent: true },
      { source: '/kg/:path*', destination: '/ky/:path*', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Файлы, приложенные к заявкам, никогда не открываются как веб-страница
        source: '/api/lead-files/file/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'none'; sandbox" },
          { key: 'Content-Disposition', value: 'attachment' },
        ],
      },
      {
        // SVG из медиатеки отображаются как картинки, но не могут выполнить скрипт, если открыть файл напрямую
        source: '/api/media/file/:file(.*\\.svg)',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" }],
      },
      {
        source: '/:file(logo.*|logo-white.*|favicon.*|og-default.jpg|apple-touch-icon.png)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
