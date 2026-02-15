'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/useTranslation'
import { Address } from '@/payload-types'
import { CreditCard, MapPin } from 'lucide-react'
import React from 'react'

type Props = {
  billingAddress: Partial<Address> | undefined
  shippingAddress: Partial<Address> | undefined
  billingAddressSameAsShipping: boolean
  selectedPaymentMethod: 'stripe' | 'zarinpal'
  onBack: () => void
  onEditAddress: () => void
  onEditPayment: () => void
  paymentForm: React.ReactNode
}

export const ConfirmOrderStep: React.FC<Props> = ({
  billingAddress,
  shippingAddress,
  billingAddressSameAsShipping,
  selectedPaymentMethod,
  onBack,
  onEditAddress,
  onEditPayment,
  paymentForm,
}) => {
  const { t } = useTranslation()

  const displayShippingAddress = billingAddressSameAsShipping ? billingAddress : shippingAddress

  return (
    <div className="flex flex-col gap-6">
      {/* Shipping Address Summary */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">{t('checkout.shippingInfo', 'Shipping Info')}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onEditAddress}>
            {t('checkout.editAddress', 'Edit')}
          </Button>
        </div>
        {displayShippingAddress && (
          <AddressItem address={displayShippingAddress} hideActions />
        )}
      </div>

      {/* Payment Method Summary */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">{t('checkout.paymentMethod', 'Payment Method')}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onEditPayment}>
            {t('checkout.editPayment', 'Edit')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedPaymentMethod === 'zarinpal'
            ? t('checkout.zarinpal.title', 'Zarinpal')
            : t('checkout.stripe.title', 'Stripe')}
          {' — '}
          {selectedPaymentMethod === 'zarinpal'
            ? t('checkout.zarinpal.description', 'Secure payment with Iranian bank cards')
            : t('checkout.stripe.description', 'International credit/debit cards')}
        </p>
      </div>

      {/* Payment Form */}
      <div className="pt-2">
        <h2 className="font-medium text-xl mb-4">{t('checkout.completePayment', 'Complete Payment')}</h2>
        {paymentForm}
      </div>

      {/* Back button */}
      <div className="flex items-center pt-4">
        <Button variant="ghost" onClick={onBack}>
          {t('checkout.prevStep', 'Previous Step')}
        </Button>
      </div>
    </div>
  )
}
