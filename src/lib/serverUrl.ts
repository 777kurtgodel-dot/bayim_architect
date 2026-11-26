/**
 * Адрес сайта без «/» в конце, например https://baiym.kg.
 * Берётся из SITE_URL при запуске сервера (а не при сборке), поэтому один и тот же
 * Docker-образ можно запускать на любом домене. NEXT_PUBLIC_SERVER_URL — для совместимости.
 */
export const SERVER_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '')
