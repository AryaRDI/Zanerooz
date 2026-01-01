import ZarinPal from 'zarinpal-node-sdk'

/**
 * Zarinpal configuration singleton
 * Documentation: https://www.zarinpal.com/docs/sdk/nodejs/
 */
export const zarinpal = new ZarinPal({
  merchantId: process.env.ZARINPAL_MERCHANT_ID || '',
  sandbox: process.env.ZARINPAL_SANDBOX === 'true',
  accessToken: process.env.ZARINPAL_ACCESS_TOKEN,
})

/**
 * Zarinpal configuration constants
 */
export const ZARINPAL_CONFIG = {
  merchantId: process.env.ZARINPAL_MERCHANT_ID || '',
  sandbox: process.env.ZARINPAL_SANDBOX === 'true',
  callbackUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/zarinpal-verify`,
  currency: 'IRR', // IRR for Rial, IRT for Toman
} as const

/**
 * Get Zarinpal payment URL from authority code
 */
export function getZarinpalPaymentUrl(authority: string): string {
  const baseUrl = ZARINPAL_CONFIG.sandbox
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay'
  
  return `${baseUrl}/${authority}`
}

/**
 * Convert amount to Rials
 * If amount is in USD, convert to IRR (approximate rate)
 * You may want to use a real exchange rate API
 */
export function convertToRials(amountInUSD: number): number {
  // Example conversion rate - update with real-time rate
  const USD_TO_IRR = 500000 // Approximate rate
  return Math.round(amountInUSD * USD_TO_IRR)
}

