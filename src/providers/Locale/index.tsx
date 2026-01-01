'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  type Locale,
  defaultLocale,
  getDirection,
  isRTL,
  locales,
  LOCALE_COOKIE_NAME,
} from '@/i18n/config'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: 'ltr' | 'rtl'
  isRTL: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const getLocaleFromCookie = (): Locale | null => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE_NAME}=([^;]+)`))
  const value = match?.[2] as Locale | undefined
  if (value && locales.includes(value)) {
    return value
  }
  return null
}

const getBrowserLocale = (): Locale | null => {
  if (typeof navigator === 'undefined') return null
  const browserLang = navigator.language.split('-')[0] as Locale
  if (locales.includes(browserLang)) {
    return browserLang
  }
  return null
}

const setLocaleCookie = (locale: Locale) => {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export const LocaleProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const router = useRouter()

  useEffect(() => {
    // Detect initial locale from cookie or browser
    const cookieLocale = getLocaleFromCookie()
    const browserLocale = getBrowserLocale()
    const initialLocale = cookieLocale || browserLocale || defaultLocale

    setLocaleState(initialLocale)

    // If no cookie was set, save the detected locale
    if (!cookieLocale) {
      setLocaleCookie(initialLocale)
    }

    // Update document attributes
    document.documentElement.lang = initialLocale
    document.documentElement.dir = getDirection(initialLocale)
  }, [])

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale)
      setLocaleCookie(newLocale)
      document.documentElement.lang = newLocale
      document.documentElement.dir = getDirection(newLocale)

      // Refresh the page to re-fetch server components with new locale
      router.refresh()
    },
    [router],
  )

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        dir: getDirection(locale),
        isRTL: isRTL(locale),
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
