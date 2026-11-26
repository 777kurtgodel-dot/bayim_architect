import type { Field, FieldHook } from 'payload'

const map: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k',
  л: 'l', м: 'm', н: 'n', ң: 'n', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[fallback] ?? originalDoc?.[fallback]
    if (typeof source === 'string' && source) return slugify(source)
    return value
  }

/** Поле «адрес страницы» (slug), заполняется автоматически из названия */
export const slugField = (fallback = 'title'): Field => ({
  name: 'slug',
  label: 'Адрес страницы (URL)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Заполняется автоматически из названия. Латиница, цифры и дефисы.',
  },
  hooks: { beforeValidate: [formatSlug(fallback)] },
})

export const orderField: Field = {
  name: 'order',
  label: 'Порядок сортировки',
  type: 'number',
  defaultValue: 100,
  admin: { position: 'sidebar', description: 'Чем меньше число, тем выше в списке' },
}
