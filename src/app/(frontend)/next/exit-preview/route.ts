import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  ;(await draftMode()).disable()
  const referer = req.headers.get('referer')
  let path = '/'
  try {
    if (referer) path = new URL(referer).pathname
  } catch {
    /* ignore */
  }
  redirect(path)
}
