import type { GlobalConfig } from 'payload'
import { anyone, authenticated, authenticatedField } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  admin: { group: 'Настройки', description: 'Контакты, соцсети, уведомления о заявках, аналитика, языки и SEO по умолчанию.' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Компания и контакты',
          fields: [
            { name: 'companyName', label: 'Название компании', type: 'text', defaultValue: 'Байым', localized: true },
            {
              name: 'tagline',
              label: 'Подпись под логотипом',
              type: 'text',
              defaultValue: 'Архитектурно-строительная компания',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  label: 'Логотип (для светлого фона)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Если не загружать, на сайте остаётся текущий логотип «Байым».' },
                },
                {
                  name: 'logoLight',
                  label: 'Логотип (для тёмного фона)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Белая версия для подвала сайта. Если не загружать, остаётся текущая.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Телефон', type: 'text', defaultValue: '+996 (999) 777-888' },
                {
                  name: 'whatsapp',
                  label: 'WhatsApp (только цифры)',
                  type: 'text',
                  defaultValue: '996999777888',
                  admin: { description: 'Например: 996999777888' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'Email', type: 'email', defaultValue: 'baiymbekov@inbox.ru' },
                {
                  name: 'telegram',
                  label: 'Telegram (ник или номер)',
                  type: 'text',
                  defaultValue: '+996999777888',
                  admin: { description: 'Например: baiym_architect или +996999777888' },
                },
              ],
            },
            { name: 'address', label: 'Адрес офиса', type: 'text', defaultValue: 'г. Бишкек, ул. Джаманбаева, 9', localized: true },
            { name: 'workHours', label: 'Часы работы', type: 'text', localized: true, admin: { description: 'Например: Пн–Сб, 9:00–18:00' } },
            {
              name: 'mapLink',
              label: 'Ссылка на компанию в 2ГИС',
              type: 'text',
              defaultValue: 'https://2gis.kg/bishkek/firm/70000001057629360/74.590827%2C42.849651',
              validate: (value: string | null | undefined) =>
                !value || /^https?:\/\/\S+$/i.test(value.trim()) || 'Нужна ссылка, которая начинается с https://',
              admin: {
                description:
                  'Откройте компанию на сайте 2gis.kg и скопируйте адрес страницы. По этой ссылке работают кнопка «Открыть в 2ГИС» и точка на карте в «Контактах». Подойдёт и ссылка на место в Google Maps.',
              },
            },
            {
              name: 'mapEmbed',
              label: 'Своя карта (необязательно)',
              type: 'text',
              admin: {
                description:
                  'Заменяет стандартную карту в «Контактах». Код из Google Maps: «Поделиться» → «Встраивание карт» → скопируйте весь код или адрес из src="...".',
              },
            },
            {
              name: 'regions',
              label: 'География работ (коротко)',
              type: 'text',
              defaultValue: 'Бишкек, Чуйская и Иссык-Кульская области',
              localized: true,
            },
            {
              name: 'socials',
              label: 'Соцсети',
              type: 'array',
              labels: { singular: 'Соцсеть', plural: 'Соцсети' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'network',
                      label: 'Сеть',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'TikTok', value: 'tiktok' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Telegram', value: 'telegram' },
                      ],
                    },
                    { name: 'url', label: 'Ссылка', type: 'text', required: true },
                  ],
                },
              ],
            },
            { name: 'footerNote', label: 'Текст в подвале', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Уведомления о заявках',
          fields: [
            {
              name: 'notifications',
              type: 'group',
              label: false,
              access: { read: authenticatedField, update: authenticatedField },
              fields: [
                {
                  name: 'emails',
                  label: 'Email для заявок',
                  type: 'text',
                  admin: { description: 'Несколько адресов через запятую. Работает, если на сервере настроена почта (SMTP).' },
                },
                {
                  name: 'telegramChatId',
                  label: 'Telegram chat ID для заявок',
                  type: 'text',
                  admin: {
                    description:
                      'ID чата или группы в Telegram, куда бот присылает заявки (можно несколько через запятую). Токен бота задаётся на сервере (TELEGRAM_BOT_TOKEN), инструкция в README.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Аналитика',
          fields: [
            {
              name: 'analytics',
              type: 'group',
              label: false,
              fields: [
                { name: 'gtmId', label: 'Google Tag Manager ID', type: 'text', admin: { description: 'GTM-XXXXXXX' } },
                { name: 'gaId', label: 'Google Analytics 4 ID', type: 'text', admin: { description: 'G-XXXXXXXXXX' } },
                { name: 'metaPixelId', label: 'Meta (Facebook/Instagram) Pixel ID', type: 'text' },
                { name: 'yandexMetrikaId', label: 'Яндекс Метрика (номер счётчика)', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Языки',
          fields: [
            {
              name: 'enableKy',
              label: 'Включить кыргызскую версию сайта',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Перед включением переведите тексты: переключите язык вверху страницы редактирования на «Кыргызча» и заполните поля. Непереведённые поля показываются на русском.',
              },
            },
          ],
        },
        {
          label: 'Политика конфиденциальности',
          fields: [
            {
              name: 'privacyPolicy',
              label: 'Текст политики конфиденциальности',
              type: 'richText',
              localized: true,
              admin: { description: 'Если оставить пустым, на сайте показывается стандартный текст.' },
            },
          ],
        },
        {
          label: 'SEO по умолчанию',
          fields: [
            {
              name: 'defaultSeo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'title',
                  label: 'Заголовок сайта',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Байым — архитектура и строительство в Бишкеке и на Иссык-Куле',
                },
                {
                  name: 'description',
                  label: 'Описание сайта',
                  type: 'textarea',
                  localized: true,
                  defaultValue:
                    'Архитектурное проектирование, строительство под ключ, документация, монолитные работы и инженерные сети. Бишкек, Чуйская и Иссык-Кульская области.',
                },
                { name: 'image', label: 'Картинка для соцсетей (1200×630)', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
