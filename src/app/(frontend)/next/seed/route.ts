import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import { seed } from '@/seed'

export const maxDuration = 120

/** Загружает демо-контент. Только после входа в админку и только пока на сайте нет услуг и проектов. */
export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return Response.json({ error: 'Нужно войти в админку' }, { status: 403 })
  }
  try {
    const result = await seed(payload)
    revalidatePath('/', 'layout')
    return Response.json(result)
  } catch (err) {
    payload.logger.error({ err, msg: 'Ошибка загрузки демо-контента' })
    return Response.json({ error: 'Не удалось загрузить демо-контент. Подробности — в логах сервера.' }, { status: 500 })
  }
}
