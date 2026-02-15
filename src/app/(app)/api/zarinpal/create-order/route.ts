import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/**
 * POST /api/zarinpal/create-order
 *
 * Create an order after successful Zarinpal payment verification
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { cartId, authority, refId, cardPan, customerEmail, shippingAddress } = body

    // Validate required fields
    if (!cartId || !authority || !refId) {
      return NextResponse.json(
        { error: 'Missing required fields: cartId, authority, refId' },
        { status: 400 },
      )
    }

    // Get the cart
    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Resolve customer ID from cart
    const customerId =
      cart.customer && typeof cart.customer === 'object' ? cart.customer.id : cart.customer

    // Create transaction record
    // Note: Using stripe field to store Zarinpal data since Transaction schema doesn't have zarinpal-specific fields
    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        status: 'succeeded',
        amount: cart.subtotal || 0,
        currency: 'IRT',
        cart: cart.id,
        items: cart.items || [],
        ...(customerId && { customer: customerId }),
        ...(customerEmail && { customerEmail }),
        // Store Zarinpal data in stripe field (repurposed for compatibility)
        stripe: {
          paymentIntentID: `zarinpal_${refId}_${authority}`,
          customerID: cardPan || null,
        },
      },
    })

    // Create order
    const order = await payload.create({
      collection: 'orders',
      data: {
        amount: cart.subtotal || 0,
        currency: 'IRT',
        status: 'processing',
        items: cart.items || [],
        transactions: [transaction.id],
        ...(customerId && { customer: customerId }),
        ...(customerEmail && { customerEmail }),
        ...(shippingAddress && { shippingAddress }),
      },
    })

    // Link transaction back to order
    await payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: {
        order: order.id,
      },
    })

    // Mark cart as purchased
    await payload.update({
      collection: 'carts',
      id: cart.id,
      data: {
        items: [],
        subtotal: 0,
        status: 'purchased',
        purchasedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      orderID: order.id,
      transactionID: transaction.id,
      message: 'Order created successfully',
    })
  } catch (error) {
    console.error('Zarinpal create order error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
