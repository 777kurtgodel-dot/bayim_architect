import Script from 'next/script'
import React from 'react'
import type { SiteSetting } from '@/payload-types'

/** Подключает счётчики, если их ID указаны в «Настройках сайта → Аналитика» */
export function Analytics({ analytics }: { analytics?: SiteSetting['analytics'] }) {
  if (!analytics) return null
  const safe = (v?: string | null) => (v || '').replace(/[^\w-]/g, '')
  const gtm = safe(analytics.gtmId)
  const ga = safe(analytics.gaId)
  const pixel = safe(analytics.metaPixelId)
  const ym = safe(analytics.yandexMetrikaId)
  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
      {ym && (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
        </Script>
      )}
      {/* Клики по WhatsApp и телефону считаем как конверсию «Contact» */}
      <Script id="contact-tracking" strategy="afterInteractive">
        {`document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="https://wa.me"],a[href^="tel:"]');if(!a)return;var t=a.href.indexOf('wa.me')>-1?'whatsapp':'phone';window.gtag&&gtag('event','contact',{method:t});window.dataLayer&&dataLayer.push({event:'contact_click',method:t});window.fbq&&fbq('track','Contact');});`}
      </Script>
    </>
  )
}
