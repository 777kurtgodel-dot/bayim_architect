import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * После любого изменения контента сбрасываем кэш сайта,
 * чтобы правки из админки сразу появлялись на страницах.
 */
const revalidateAll = async () => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // вне Next.js (например, в скрипте seed) ревалидация не нужна
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!req.context?.disableRevalidate) await revalidateAll()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (!req.context?.disableRevalidate) await revalidateAll()
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  if (!req.context?.disableRevalidate) await revalidateAll()
  return doc
}

export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
}
