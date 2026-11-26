export const leadStatuses = [
  { label: '🟢 Новая', value: 'new' },
  { label: '🟡 В работе', value: 'in_progress' },
  { label: '🔵 Встреча / консультация', value: 'meeting' },
  { label: '🟣 Отправлен расчёт / КП', value: 'proposal' },
  { label: '✅ Договор заключён', value: 'won' },
  { label: '⚪ Отказ', value: 'lost' },
  { label: '🚫 Спам', value: 'spam' },
]

export const projectStages = [
  { label: 'Есть только идея', value: 'idea' },
  { label: 'Есть участок', value: 'land' },
  { label: 'Есть проект / чертежи', value: 'project' },
  { label: 'Объект строится', value: 'construction' },
  { label: 'Объект построен', value: 'built' },
]

/** Подпись варианта без эмодзи-префикса */
export const labelOf = (list: { label: string; value: string }[], v?: string | null) =>
  list.find((x) => x.value === v)?.label.replace(/^[^\p{L}]+/u, '') || v || ''
