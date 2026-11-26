import type { Metadata } from 'next'
import React from 'react'
import { PageHero, RichText } from '@/components/site/Blocks'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/payload'
import { buildMetadata } from '@/lib/site'

type Params = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({ locale, path: '/privacy', title: dict.privacy.title, settings: await getSettings(locale) })
}

/** Текст по умолчанию — показывается, пока в «Настройках сайта» не заполнен собственный */
const DefaultPolicy = ({ company, email, phone }: { company: string; email?: string | null; phone?: string | null }) => (
  <div className="prose">
    <p>
      Настоящая политика описывает, какие персональные данные собирает сайт компании «{company}» и как они используются. Мы
      руководствуемся Законом Кыргызской Республики «Об информации персонального характера».
    </p>
    <h2>Какие данные мы получаем</h2>
    <p>
      Когда вы отправляете заявку, мы получаем данные, которые вы сами указали в форме: имя, телефон, email, регион, описание задачи и
      приложенные файлы. Также сайт может собирать обезличенную статистику посещений (например, Google Analytics, Яндекс Метрика, Meta
      Pixel) — тип устройства, страницы, источник перехода.
    </p>
    <h2>Зачем</h2>
    <p>
      Данные из заявки используются только для того, чтобы связаться с вами, ответить на вопрос, подготовить расчёт или коммерческое
      предложение. Мы не продаём и не передаём ваши данные третьим лицам, кроме случаев, предусмотренных законом.
    </p>
    <h2>Как мы храним данные</h2>
    <p>
      Заявки хранятся в защищённой системе управления сайтом, доступ к которой есть только у уполномоченных сотрудников компании.
      Соединение с сайтом защищено (HTTPS).
    </p>
    <h2>Ваши права</h2>
    <p>
      Вы можете попросить уточнить, изменить или удалить ваши данные, написав нам
      {email ? (
        <>
          {' '}
          на <a href={`mailto:${email}`}>{email}</a>
        </>
      ) : null}
      {phone ? <> или по телефону {phone}</> : null}.
    </p>
  </div>
)

export default async function PrivacyPage({ params }: Params) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const settings = await getSettings(locale)
  const custom = <RichText data={settings.privacyPolicy} />
  const hasCustom =
    settings.privacyPolicy &&
    typeof settings.privacyPolicy === 'object' &&
    (settings.privacyPolicy as { root?: { children?: unknown[] } }).root?.children?.length
  return (
    <>
      <PageHero title={dict.privacy.title} />
      <section className="section section--tight">
        <div className="container container--narrow">
          {hasCustom ? custom : <DefaultPolicy company={settings.companyName || 'Байым'} email={settings.email} phone={settings.phone} />}
        </div>
      </section>
    </>
  )
}
