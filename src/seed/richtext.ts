/** Минимальный конструктор Lexical-документа для начального наполнения */
type Block = string | { h2: string } | { h3: string } | { ul: string[] }

const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })

const paragraph = (t: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children: [text(t)],
})

type LexicalNode = { type: string; version: number; [k: string]: unknown }
export type RichTextDoc = {
  root: {
    type: string
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
    indent: number
    version: number
    direction: 'ltr' | 'rtl' | null
    children: LexicalNode[]
  }
  [k: string]: unknown
}

export const richText = (blocks: Block[]): RichTextDoc => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: blocks.map((b): LexicalNode => {
      if (typeof b === 'string') return paragraph(b)
      if ('h2' in b || 'h3' in b) {
        const tag = 'h2' in b ? 'h2' : 'h3'
        return { type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: [text('h2' in b ? b.h2 : b.h3)] }
      }
      return {
        type: 'list',
        listType: 'bullet',
        tag: 'ul',
        start: 1,
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: b.ul.map((item, i) => ({
          type: 'listitem',
          value: i + 1,
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [text(item)],
        })),
      }
    }),
  },
})
