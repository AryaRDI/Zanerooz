'use client'
import { useLocale } from '@/providers/Locale'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

// Conversion rate from USD to IRR (Rial)
// IRT (Toman) = IRR / 10
const USD_TO_IRR = 1450000

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount?: number | null
  amountIRT?: number | null
  currencyCode?: string
  highestAmount?: never
  highestAmountIRT?: never
  lowestAmount?: never
  lowestAmountIRT?: never
}

type PriceRange = {
  amount?: never
  amountIRT?: never
  currencyCode?: string
  highestAmount?: number | null
  highestAmountIRT?: number | null
  lowestAmount?: number | null
  lowestAmountIRT?: number | null
}

type Props = BaseProps & (PriceFixed | PriceRange)

/**
 * Convert USD amount to IRT (Iranian Toman) - fallback when IRT not provided
 */
function convertToToman(amountInUSD: number): number {
  return Math.round((amountInUSD * USD_TO_IRR) / 10)
}

/**
 * Format amount in IRT (Iranian Toman)
 */
function formatToman(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} تومان`
}

export const Price = ({
  amount,
  amountIRT,
  className,
  highestAmount,
  highestAmountIRT,
  lowestAmount,
  lowestAmountIRT,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { formatCurrency, supportedCurrencies } = useCurrency()
  const { locale } = useLocale()

  const Element = as
  const isFarsi = locale === 'fa'

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find((currency) => currency.code === currencyCodeFromProps)
    }
    return undefined
  }, [currencyCodeFromProps, supportedCurrencies])

  /**
   * Format price based on locale and available prices
   * - For Farsi: Use IRT price if available, otherwise convert from USD
   * - For other locales: Use USD price with standard formatting
   * - Returns null if no valid price can be determined
   */
  const formatPrice = (priceInUSD?: number | null, priceInIRT?: number | null): string | null => {
    if (isFarsi) {
      // For Farsi locale, prefer IRT, fallback to converted USD
      if (typeof priceInIRT === 'number') {
        return formatToman(priceInIRT)
      }
      if (typeof priceInUSD === 'number') {
        return formatToman(convertToToman(priceInUSD))
      }
      return null
    }
    // For other locales, use USD
    if (typeof priceInUSD === 'number') {
      return formatCurrency(priceInUSD, { currency: currencyToUse })
    }
    return null
  }

  // Fixed price (single amount)
  const fixedPrice = formatPrice(amount, amountIRT)
  if (fixedPrice) {
    return (
      <Element className={className} suppressHydrationWarning>
        {fixedPrice}
      </Element>
    )
  }

  // Price range
  const lowPrice = formatPrice(lowestAmount, lowestAmountIRT)
  const highPrice = formatPrice(highestAmount, highestAmountIRT)

  if (lowPrice && highPrice && lowPrice !== highPrice) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${lowPrice} - ${highPrice}`}
      </Element>
    )
  }

  if (lowPrice) {
    return (
      <Element className={className} suppressHydrationWarning>
        {lowPrice}
      </Element>
    )
  }

  return null
}
