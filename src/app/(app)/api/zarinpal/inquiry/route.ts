import { NextRequest, NextResponse } from 'next/server'
import { zarinpal } from '@/lib/zarinpal/config'

/**
 * POST /api/zarinpal/inquiry
 * 
 * Inquire about a transaction status with Zarinpal
 * Useful for checking transaction details after payment
 * 
 * Documentation: https://www.zarinpal.com/docs/sdk/nodejs/method/inquiry.html
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authority } = body

    // Validate required field
    if (!authority) {
      return NextResponse.json(
        { error: 'Missing required field: authority' },
        { status: 400 }
      )
    }

    // Inquire transaction status
    const response = await zarinpal.inquiries.inquire({ authority })

    if (!response.data) {
      return NextResponse.json(
        { error: 'Failed to inquire transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ...response.data,
    })

  } catch (error) {
    console.error('Zarinpal inquiry error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to inquire transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

