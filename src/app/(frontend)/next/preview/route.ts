import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

/** Включает предпросмотр черновиков. Доступно только вошедшим в админку сотрудникам. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Неверный адрес', { status: 400 })
  }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Войдите в админ-панель, чтобы смотреть черновики', { status: 403 })
  }
  ;(await draftMode()).enable()
  redirect(path)
}
