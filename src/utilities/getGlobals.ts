import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { headers } from 'next/headers'

import { LOCALE_COOKIE_NAME, type Locale, defaultLocale, locales } from '@/i18n/config'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0, locale?: Locale) {
  const payload = await getPayload({ config: configPromise })

  const resolvedLocale = locale || defaultLocale

  const global = await payload.findGlobal({
    slug,
    depth,
    locale: resolvedLocale,
    // If the requested locale is missing content, fall back to the other locale.
    // This prevents "empty" localized globals when only one locale has been filled out.
    ...(resolvedLocale === 'fa'
      ? { fallbackLocale: 'en' as const }
      : resolvedLocale === 'en'
        ? { fallbackLocale: 'fa' as const }
        : {}),
  })

  return global
}

/**
 * Gets the current locale from cookies
 */
export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)

  const cookieLocale = localeCookie?.value as Locale | undefined
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale

  // If the locale cookie doesn't exist yet (common on first request),
  // fall back to the browser locale derived from Accept-Language.
  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language')
  const headerLocale = getLocaleFromAcceptLanguage(acceptLanguage)

  return headerLocale || defaultLocale
}

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null

  // Example: "en-US,en;q=0.9,fa;q=0.8"
  const langs = acceptLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0]?.trim())
    .filter(Boolean) as string[]

  for (const lang of langs) {
    const base = lang.split('-')[0] as Locale
    if (locales.includes(base)) return base
  }

  return null
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale?: Locale) =>
  // In dev, avoid caching globals to prevent confusion while iterating in the admin UI.
  // In prod, cache with a tag for on-demand revalidation (and a small TTL as a safety net).
  process.env.NODE_ENV === 'development'
    ? async () => getGlobal<T>(slug, depth, locale)
    : unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, locale || 'default'], {
        tags: [`global_${slug}`],
        revalidate: 60,
      })
