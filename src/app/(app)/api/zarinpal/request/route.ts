import { NextRequest, NextResponse } from 'next/server'
import { zarinpal, ZARINPAL_CONFIG, convertToRials, getZarinpalPaymentUrl } from '@/lib/zarinpal/config'
import type { ZarinpalPaymentRequest } from '@/lib/zarinpal/types'

/**
 * Format phone number to Iranian mobile format
 * Zarinpal requires: 09XXXXXXXXX (11 digits starting with 09)
 */
function formatIranianMobile(phone: string): string | undefined {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Check if it's already in correct format (09XXXXXXXXX)
  if (/^09\d{9}$/.test(digitsOnly)) {
    return digitsOnly
  }
  
  // Try to fix common formats
  // If starts with +98 or 98, convert to 09
  if (digitsOnly.startsWith('98') && digitsOnly.length === 12) {
    return '0' + digitsOnly.slice(2)
  }
  
  // If it's 10 digits starting with 9, add 0
  if (/^9\d{9}$/.test(digitsOnly)) {
    return '0' + digitsOnly
  }
  
  // If none of the formats match, skip mobile (don't send invalid format)
  console.warn(`Invalid Iranian mobile format: ${phone}, skipping mobile field`)
  return undefined
}

/**
 * POST /api/zarinpal/request
 * 
 * Create a payment request with Zarinpal
 * Returns authority code and payment URL for redirecting user
 * 
 * Documentation: https://www.zarinpal.com/docs/sdk/nodejs/method/request.html
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amountInUSD, amountInIRT, description, mobile, email, orderId } = body

    // Validate required fields
    if ((!amountInUSD && !amountInIRT) || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amountInUSD or amountInIRT, description' },
        { status: 400 }
      )
    }

    // Validate Zarinpal configuration
    if (!ZARINPAL_CONFIG.merchantId) {
      return NextResponse.json(
        { error: 'Zarinpal merchant ID not configured' },
        { status: 500 }
      )
    }

    // Convert to Rials: prefer IRT (Toman) if available, otherwise convert from USD
    // 1 Toman = 10 Rials
    const amountInRials = amountInIRT
      ? Math.round(amountInIRT * 10)
      : convertToRials(amountInUSD)

    // Minimum payment amount is 10,000 Rials
    if (amountInRials < 10000) {
      return NextResponse.json(
        { error: 'Minimum payment amount is 10,000 Rials' },
        { status: 400 }
      )
    }

    // Validate and format mobile number for Zarinpal
    // Zarinpal requires Iranian mobile format: 09XXXXXXXXX (11 digits starting with 09)
    const formattedMobile = mobile ? formatIranianMobile(mobile) : undefined

    // Prepare payment request
    const paymentRequest: ZarinpalPaymentRequest = {
      amount: amountInRials,
      description: description || `Order #${orderId || 'N/A'}`,
      callback_url: ZARINPAL_CONFIG.callbackUrl,
      currency: ZARINPAL_CONFIG.currency,
    }

    // Add optional fields only if valid
    if (formattedMobile) paymentRequest.mobile = formattedMobile
    if (email) paymentRequest.email = email

    // Create payment request with Zarinpal
    const response = await zarinpal.payments.create(paymentRequest)

    // Check if request was successful
    if (!response.data || !response.data.authority) {
      return NextResponse.json(
        { 
          error: 'Failed to create payment request',
          details: response.data?.message || 'Unknown error'
        },
        { status: 500 }
      )
    }

    const { authority } = response.data
    const paymentUrl = getZarinpalPaymentUrl(authority)

    return NextResponse.json({
      success: true,
      authority,
      paymentUrl,
      amount: amountInRials,
      message: 'Payment request created successfully',
    })

  } catch (error) {
    console.error('Zarinpal payment request error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

