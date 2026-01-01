'use client'

import React from 'react'
import { Globe } from 'lucide-react'

import { useLocale } from '@/providers/Locale'
import { type Locale, localeNames, locales } from '@/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLocale()

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        className="w-auto gap-2 border-none bg-transparent shadow-none"
        aria-label="Select language"
      >
        <Globe className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
