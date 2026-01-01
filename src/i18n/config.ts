export const locales = ['en', 'fa'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fa'

export const rtlLocales: Locale[] = ['fa']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
}

export const isRTL = (locale: Locale): boolean => rtlLocales.includes(locale)

export const getDirection = (locale: Locale): 'ltr' | 'rtl' => (isRTL(locale) ? 'rtl' : 'ltr')

export const LOCALE_COOKIE_NAME = 'payload-locale'
