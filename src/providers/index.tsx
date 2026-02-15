import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                priceInUSD: true,
                priceInUSDEnabled: true,
                priceInIRT: true,
                priceInIRTEnabled: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                priceInUSD: true,
                priceInUSDEnabled: true,
                priceInIRT: true,
                priceInIRTEnabled: true,
                  },
                },
              },
            }}
            currenciesConfig={{
              defaultCurrency: 'USD',
              supportedCurrencies: [
                { code: 'USD', decimals: 2, label: 'US Dollar', symbol: '$' },
                { code: 'IRT', decimals: 0, label: 'Iranian Toman', symbol: 'تومان' },
              ],
            }}
            paymentMethods={[
              stripeAdapterClient({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
              }),
            ]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}
