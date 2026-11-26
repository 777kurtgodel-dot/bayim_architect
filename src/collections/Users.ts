import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/** Пользователи админки. Роль одна: у каждого пользователя полный доступ. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'updatedAt'],
    group: 'Настройки',
    description: 'Кто может входить в админ-панель. У всех пользователей полный доступ: заявки, контент, настройки и пользователи.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 7,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    { name: 'phone', label: 'Телефон', type: 'text' },
  ],
  hooks: {
    beforeDelete: [
      async ({ req }) => {
        // Нельзя удалить последнего пользователя: иначе в админку никто не войдёт
        const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
        if (totalDocs <= 1) throw new Error('Нельзя удалить последнего пользователя')
      },
    ],
  },
}
