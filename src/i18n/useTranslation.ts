'use client'

import { useEffect, useState } from 'react'

import { useLocale } from '@/providers/Locale'
import type { Dictionary } from './getDictionary'
import { getDictionary } from './getDictionary'

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<Dictionary>

export function useTranslation() {
  const { locale } = useLocale()
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)

  useEffect(() => {
    getDictionary(locale).then(setDictionary)
  }, [locale])

  const t = (key: TranslationKey, fallback?: string): string => {
    if (!dictionary) return fallback || key

    const keys = key.split('.')
    let value: unknown = dictionary

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === 'string' ? value : fallback || key
  }

  return { t, locale, isLoading: !dictionary }
}
