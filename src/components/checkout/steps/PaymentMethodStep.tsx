'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/i18n/useTranslation'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard } from 'lucide-react'
import React from 'react'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = apiKey ? loadStripe(apiKey) : null

type Props = {
  selectedMethod: 'stripe' | 'zarinpal'
  setSelectedMethod: (method: 'stripe' | 'zarinpal') => void
  onNext: () => void
  onBack: () => void
}

export const PaymentMethodStep: React.FC<Props> = ({
  selectedMethod,
  setSelectedMethod,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation()

  const zarinpalEnabled = process.env.NEXT_PUBLIC_ZARINPAL_ENABLED === 'true'

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-medium text-xl">{t('checkout.paymentMethod', 'Payment Method')}</h2>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => setSelectedMethod(value as 'stripe' | 'zarinpal')}
        className="flex flex-col gap-4"
      >
        {zarinpalEnabled && (
          <Label
            htmlFor="payment-zarinpal"
            className={`
              flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-colors
              ${selectedMethod === 'zarinpal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <RadioGroupItem value="zarinpal" id="payment-zarinpal" />
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{t('checkout.zarinpal.title', 'Zarinpal')}</p>
              <p className="text-sm text-muted-foreground">
                {t('checkout.zarinpal.description', 'Secure payment with Iranian bank cards')}
              </p>
            </div>
          </Label>
        )}

        {stripe && (
          <Label
            htmlFor="payment-stripe"
            className={`
              flex items-center gap-4 border rounded-lg p-4 cursor-pointer transition-colors
              ${selectedMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <RadioGroupItem value="stripe" id="payment-stripe" />
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{t('checkout.stripe.title', 'Stripe')}</p>
              <p className="text-sm text-muted-foreground">
                {t('checkout.stripe.description', 'International credit/debit cards')}
              </p>
            </div>
          </Label>
        )}
      </RadioGroup>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          {t('checkout.prevStep', 'Previous Step')}
        </Button>
        <Button onClick={onNext}>
          {t('checkout.nextStep', 'Next Step')}
        </Button>
      </div>
    </div>
  )
}
