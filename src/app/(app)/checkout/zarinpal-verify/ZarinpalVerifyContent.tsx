'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/useTranslation'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export const ZarinpalVerifyContent: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart, clearCart } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useTranslation()
  
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [refId, setRefId] = useState<string | null>(null)
  
  // Ensure we only verify once
  const isVerifying = useRef(false)

  useEffect(() => {
    const verifyPayment = async () => {
      // Get parameters from URL
      const status = searchParams.get('Status')
      const authority = searchParams.get('Authority')

      // Check if payment was cancelled by user
      if (status === 'NOK') {
        setError('Payment was cancelled or declined. You can try again.')
        setVerifying(false)
        return
      }

      // Check if status is OK and we have authority
      if (status !== 'OK' || !authority) {
        setError('Invalid payment response from gateway. Please contact support.')
        setVerifying(false)
        return
      }

      // Get stored payment data from sessionStorage
      const paymentDataStr = sessionStorage.getItem('zarinpal_payment')
      if (!paymentDataStr) {
        setError('Payment session expired. Please start a new checkout.')
        setVerifying(false)
        return
      }

      const paymentData = JSON.parse(paymentDataStr)
      const { amount, customerEmail, shippingAddress } = paymentData

      // Prevent duplicate verification
      if (isVerifying.current) {
        return
      }
      isVerifying.current = true

      try {
        // Verify payment with Zarinpal
        const verifyResponse = await fetch('/api/zarinpal/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authority,
            amount,
          }),
        })

        const verifyData = await verifyResponse.json()

        if (!verifyResponse.ok || !verifyData.verified) {
          console.error('Zarinpal verification failed:', verifyData)
          throw new Error(verifyData.message || verifyData.error || 'Payment verification failed')
        }

        console.log('✅ Payment verified successfully:', verifyData.refId)

        // Payment verified successfully, now create order directly
        const createOrderResponse = await fetch('/api/zarinpal/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartId: paymentData.cartId,
            authority,
            refId: verifyData.refId,
            cardPan: verifyData.cardPan,
            customerEmail,
            shippingAddress: shippingAddress || null,
          }),
        })

        const orderData = await createOrderResponse.json()

        if (!createOrderResponse.ok || !orderData.orderID) {
          console.error('Order creation failed:', orderData)
          throw new Error(orderData.error || 'Failed to create order')
        }

        console.log('✅ Order created successfully:', orderData.orderID)

        setRefId(verifyData.refId?.toString())
        setSuccess(true)
        
        // Clear payment data from sessionStorage
        sessionStorage.removeItem('zarinpal_payment')
        
        // Clear cart
        clearCart()

        // Redirect to order page after a short delay
        setTimeout(() => {
          const redirectUrl = `/orders/${orderData.orderID}${customerEmail ? `?email=${customerEmail}` : ''}`
          router.push(redirectUrl)
        }, 2000)

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while verifying payment: ${msg}`)
      } finally {
        setVerifying(false)
      }
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      // Cart is empty, either payment already processed or error
      setVerifying(false)
      return
    }

    verifyPayment()
  }, [cart, searchParams, confirmOrder, clearCart, router, t])

  if (verifying) {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-4">
        <h1 className="text-2xl font-bold">
          Verifying Payment...
        </h1>
        <LoadingSpinner className="w-12 h-12" />
        <p className="text-muted-foreground">
          Please wait, this may take a few moments
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-6 max-w-md">
        <h1 className="text-2xl font-bold text-red-600">
          Payment Failed
        </h1>
        <Message error={error} />
        <div className="flex gap-4">
          <Button asChild variant="default">
            <Link href="/checkout">{t('common.tryAgain', 'Try Again')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (success && refId) {
    return (
      <div className="text-center w-full flex flex-col items-center justify-start gap-6 max-w-md">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
          Payment Successful
        </h1>
        <div className="bg-accent dark:bg-card rounded-lg p-4 w-full">
          <p className="text-sm text-muted-foreground mb-2">
            Reference ID:
          </p>
          <p className="text-lg font-mono font-bold">{refId}</p>
        </div>
        <p className="text-muted-foreground">
          Redirecting to your order...
        </p>
      </div>
    )
  }

  return null
}

