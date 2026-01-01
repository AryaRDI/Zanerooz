/**
 * Zarinpal Payment Request Response
 */
export interface ZarinpalPaymentRequest {
  amount: number
  description: string
  callback_url: string
  mobile?: string
  email?: string
  currency?: 'IRR' | 'IRT'
}

/**
 * Zarinpal Payment Response
 */
export interface ZarinpalPaymentResponse {
  data: {
    code: number
    message: string
    authority: string
    fee_type: string
    fee: number
  }
}

/**
 * Zarinpal Verification Request
 */
export interface ZarinpalVerificationRequest {
  authority: string
  amount: number
}

/**
 * Zarinpal Verification Response
 */
export interface ZarinpalVerificationResponse {
  data: {
    code: number
    message: string
    card_hash: string
    card_pan: string
    ref_id: number
    fee_type: string
    fee: number
  }
}

/**
 * Payment status codes from Zarinpal
 * Code 100: Payment successful
 * Code 101: Payment already verified
 * Other codes: Various error states
 */
export const ZARINPAL_STATUS_CODES = {
  SUCCESS: 100,
  ALREADY_VERIFIED: 101,
} as const

