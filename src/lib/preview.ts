/** Ссылка «Предпросмотр» в админке: включает режим черновиков и открывает страницу */
export const previewPath = (path: string) => `/next/preview?path=${encodeURIComponent(path)}`
