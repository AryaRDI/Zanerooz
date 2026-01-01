import { NextRequest, NextResponse } from 'next/server'
import { zarinpal } from '@/lib/zarinpal/config'
import { ZARINPAL_STATUS_CODES } from '@/lib/zarinpal/types'
import type { ZarinpalVerificationRequest } from '@/lib/zarinpal/types'

/**
 * POST /api/zarinpal/verify
 * 
 * Verify a payment with Zarinpal after user returns from payment gateway
 * This should be called from the callback page with authority and amount
 * 
 * Documentation: https://www.zarinpal.com/docs/sdk/nodejs/method/verify.html
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authority, amount } = body

    // Validate required fields
    if (!authority || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: authority, amount' },
        { status: 400 }
      )
    }

    // Prepare verification request
    const verificationRequest: ZarinpalVerificationRequest = {
      authority,
      amount: parseInt(amount.toString()),
    }

    // Verify payment with Zarinpal
    const response = await zarinpal.verifications.verify(verificationRequest)

    // Check response
    if (!response.data) {
      return NextResponse.json(
        { 
          error: 'Failed to verify payment',
          verified: false,
        },
        { status: 500 }
      )
    }

    const { code, message, ref_id, card_pan, fee } = response.data

    // Check if payment was successful
    if (code === ZARINPAL_STATUS_CODES.SUCCESS) {
      return NextResponse.json({
        success: true,
        verified: true,
        refId: ref_id,
        cardPan: card_pan,
        fee,
        message: 'Payment verified successfully',
      })
    }

    // Check if payment was already verified
    if (code === ZARINPAL_STATUS_CODES.ALREADY_VERIFIED) {
      return NextResponse.json({
        success: true,
        verified: true,
        alreadyVerified: true,
        refId: ref_id,
        cardPan: card_pan,
        fee,
        message: 'Payment already verified',
      })
    }

    // Payment verification failed
    return NextResponse.json(
      {
        success: false,
        verified: false,
        code,
        message: message || 'Payment verification failed',
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('Zarinpal verification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        verified: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

