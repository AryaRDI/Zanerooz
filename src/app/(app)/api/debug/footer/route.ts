import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'

import { LOCALE_COOKIE_NAME, type Locale, defaultLocale, locales } from '@/i18n/config'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const headerStore = await headers()

  const cookieLocaleRaw = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null
  const acceptLanguage = headerStore.get('accept-language')

  const cookieLocale =
    cookieLocaleRaw && locales.includes(cookieLocaleRaw as Locale)
      ? (cookieLocaleRaw as Locale)
      : null

  const payload = await getPayload({ config: configPromise })

  const [footerEn, footerFa] = await Promise.all([
    payload.findGlobal({
      slug: 'footer',
      depth: 1,
      locale: 'en',
    }),
    payload.findGlobal({
      slug: 'footer',
      depth: 1,
      locale: 'fa',
      fallbackLocale: 'en',
    }),
  ])

  return Response.json({
    detected: {
      cookieLocaleRaw,
      cookieLocale,
      defaultLocale,
      acceptLanguage,
    },
    footer: {
      en: {
        brand: footerEn?.brand,
        linkGroups: footerEn?.linkGroups,
        badges: footerEn?.badges,
      },
      fa: {
        brand: footerFa?.brand,
        linkGroups: footerFa?.linkGroups,
        badges: footerFa?.badges,
      },
    },
  })
}


