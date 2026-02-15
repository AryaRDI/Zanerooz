'use client'

import React, { FormEvent, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Message } from '@/components/Message'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useTranslation } from '@/i18n/useTranslation'
import { Address } from '@/payload-types'

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  cartTotal: number
  cartTotalIRT?: number
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

export const ZarinpalCheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  shippingAddress,
  cartTotal,
  cartTotalIRT,
  setProcessingPayment,
}) => {
  const [error, setError] = useState<null | string>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { cart } = useCart()
  const { t } = useTranslation()

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setProcessingPayment(true)
      setError(null)

      try {
        // Create payment request with Zarinpal
        const response = await fetch('/api/zarinpal/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amountInUSD: cartTotal,
            amountInIRT: cartTotalIRT,
            description: `Order payment - ${cart?.items?.length || 0} items`,
            mobile: billingAddress?.phone,
            email: customerEmail,
            orderId: cart?.id,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create payment request')
        }

        // Store payment data in sessionStorage for verification callback
        // Include shippingAddress so the order can be created with it after verification
        sessionStorage.setItem('zarinpal_payment', JSON.stringify({
          authority: data.authority,
          amount: data.amount,
          customerEmail,
          cartId: cart?.id,
          shippingAddress: shippingAddress || billingAddress || null,
        }))

        // Redirect to Zarinpal payment gateway
        window.location.href = data.paymentUrl

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        setError(`Error while initiating payment: ${msg}`)
        setIsLoading(false)
        setProcessingPayment(false)
      }
    },
    [cartTotal, cartTotalIRT, billingAddress?.phone, customerEmail, cart?.id, cart?.items?.length, setProcessingPayment, shippingAddress, billingAddress],
  )

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="mb-4">
          <Message error={error} />
        </div>
      )}

      <div className="bg-accent dark:bg-card rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">
          پرداخت با زرین‌پال
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          با کلیک بر روی دکمه پرداخت، به درگاه امن زرین‌پال منتقل خواهید شد.
        </p>

        <div className="space-y-2 text-sm">
          {customerEmail && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('auth.email')}:</span>
              <span className="font-medium">{customerEmail}</span>
            </div>
          )}
          {billingAddress?.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{billingAddress.phone}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner className="w-4 h-4" />
            {t('checkout.processing', 'Processing...')}
          </span>
        ) : (
          'پرداخت با زرین‌پال'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        پرداخت شما از طریق درگاه امن زرین‌پال انجام می‌شود
      </p>
    </form>
  )
}
