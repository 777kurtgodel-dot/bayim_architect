import type { Access, FieldAccess } from 'payload'

/*
 * В админке одна роль: каждый пользователь — администратор с полным доступом.
 * Посетители сайта видят только опубликованный контент и ничего не могут менять.
 */

/** Любой вошедший пользователь админки */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** То же для отдельных полей: например, получатели уведомлений не видны через открытый API */
export const authenticatedField: FieldAccess = ({ req: { user } }) => Boolean(user)

/** Посетители видят только опубликованное, пользователи админки — и черновики */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
