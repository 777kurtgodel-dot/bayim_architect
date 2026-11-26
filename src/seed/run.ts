/**
 * Загрузка демо-контента из командной строки: `npm run seed`.
 * Если заданы SEED_ADMIN_EMAIL и SEED_ADMIN_PASSWORD и пользователей ещё нет — создаст администратора.
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { seed } from './index'

const payload = await getPayload({ config })
try {
  const result = await seed(payload, (msg) => console.log(`• ${msg}`))
  if (!result.adminCreated) {
    const users = await payload.count({ collection: 'users' })
    if (users.totalDocs === 0) {
      console.log('• Пользователей пока нет: откройте /admin и создайте первого — он станет администратором.')
    }
  }
} catch (err) {
  console.error('Не удалось загрузить демо-контент:', err)
  process.exitCode = 1
}
