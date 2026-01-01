/**
 * Zarinpal Payment Adapter for Payload CMS Ecommerce Plugin
 * 
 * This adapter integrates Zarinpal with Payload's ecommerce plugin.
 * The actual payment logic is handled by our custom API routes.
 */
export const zarinpalAdapter = () => ({
  group: 'zarinpal' as const,
  label: 'Zarinpal',
  name: 'zarinpal',
  
  /**
   * Initialize payment - called when user clicks "Go to payment"
   * For Zarinpal, we just return a flag since the actual payment
   * request is made from the frontend component
   */
  initiatePayment: async ({ data, req }: any) => {
    // Return minimal data - actual payment request happens in frontend
    return {
      paymentID: 'zarinpal',
      message: 'Payment initiated with Zarinpal',
      data: {
        method: 'zarinpal',
        cartId: data.cart.id,
        customerEmail: data.customerEmail,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
      },
    }
  },

  /**
   * Confirm order - called after user returns from Zarinpal
   * This is where we verify the payment and create the order
   */
  confirmOrder: async ({ data, req, ordersSlug, transactionsSlug }: any) => {
    const { authority, refId, cardPan, customerEmail } = data?.additionalData || {}

    if (!authority || !refId) {
      throw new Error('Missing payment verification data from Zarinpal')
    }

    // The transaction ID from Zarinpal is the refId
    const transactionID = refId.toString()

    // Return the minimum required data
    // The ecommerce plugin will handle creating the order and transaction
    return {
      message: 'Payment confirmed with Zarinpal',
      orderID: null, // Will be populated by plugin
      transactionID,
      // Store Zarinpal-specific data in the transaction metadata
      metadata: {
        authority,
        refId,
        cardPan,
        gateway: 'zarinpal',
        paymentMethod: 'zarinpal',
      },
    }
  },

  /**
   * Webhook handler - Zarinpal uses redirects instead of webhooks
   * Keep this for compatibility but it won't be used
   */
  handleWebhook: async ({ req }: any) => {
    // Zarinpal uses redirect-based callbacks, not webhooks
    throw new Error('Webhooks not supported for Zarinpal')
  },

  /**
   * Optional: Get payment details
   */
  getPaymentDetails: async ({ transactionID }: any) => {
    return {
      transactionID: transactionID || '',
      data: {
        gateway: 'zarinpal',
      },
    }
  },
})

