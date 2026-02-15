'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { ZarinpalCheckoutForm } from '@/components/forms/ZarinpalCheckoutForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cssVariables } from '@/cssVariables'
import { useTranslation } from '@/i18n/useTranslation'
import { Address } from '@/payload-types'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

import { CheckoutStepper } from './CheckoutStepper'
import { ConfirmOrderStep } from './steps/ConfirmOrderStep'
import { PaymentMethodStep } from './steps/PaymentMethodStep'
import { ShippingAddressStep } from './steps/ShippingAddressStep'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = apiKey ? loadStripe(apiKey) : null

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Existing state
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'zarinpal'>('zarinpal')
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const subtotalIRT = React.useMemo(() => {
    if (!cart?.items?.length) return undefined
    let total = 0
    let hasIRT = false
    for (const item of cart.items) {
      const product = item.product
      if (typeof product !== 'object' || !product) continue
      const variant = item.variant
      let irt: number | null | undefined
      if (variant && typeof variant === 'object') {
        irt = variant.priceInIRT
      } else {
        irt = product.priceInIRT
      }
      if (typeof irt === 'number') {
        hasIRT = true
        total += irt * (item.quantity || 1)
      }
    }
    return hasIRT ? total : undefined
  }, [cart?.items])

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiateStripePayment = useCallback(async () => {
    try {
      const paymentData = (await initiatePayment('stripe', {
        additionalData: {
          ...(email ? { customerEmail: email } : {}),
          billingAddress,
          shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
        },
      })) as { clientSecret?: string }

      if (paymentData?.clientSecret) {
        setStripeClientSecret(paymentData.clientSecret)
      }
    } catch (error) {
      const errorData = error instanceof Error ? JSON.parse(error.message) : {}
      let errorMessage = t(
        'checkout.paymentInitError',
        'An error occurred while initiating payment.',
      )

      if (errorData?.cause?.code === 'OutOfStock') {
        errorMessage = t(
          'checkout.outOfStockError',
          'One or more items in your cart are out of stock.',
        )
      }

      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [billingAddress, billingAddressSameAsShipping, shippingAddress, email, initiatePayment, t])

  const cancelPayment = useCallback(() => {
    setStripeClientSecret(null)
  }, [])

  // Step transitions
  const goToStep2 = useCallback(() => {
    setCurrentStep(2)
  }, [])

  const goToStep3 = useCallback(async () => {
    if (selectedPaymentMethod === 'stripe') {
      await initiateStripePayment()
    }
    setCurrentStep(3)
  }, [selectedPaymentMethod, initiateStripePayment])

  const goBackToStep1 = useCallback(() => {
    setCurrentStep(1)
  }, [])

  const goBackToStep2 = useCallback(() => {
    if (stripeClientSecret) {
      cancelPayment()
    }
    setCurrentStep(2)
  }, [stripeClientSecret, cancelPayment])

  // Check if at least one payment method is configured
  const hasPaymentMethod = Boolean(stripe || process.env.NEXT_PUBLIC_ZARINPAL_ENABLED === 'true')

  if (!hasPaymentMethod) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{t('checkout.noPaymentMethod', 'No payment method configured')}</p>
      </div>
    )
  }

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>{t('checkout.processing')}</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{t('cart.empty')}</p>
        <Link href="/products">{t('cart.continueShopping')}</Link>
      </div>
    )
  }

  // Build the payment form for step 3
  const renderPaymentForm = () => {
    if (selectedPaymentMethod === 'zarinpal') {
      const effectiveShippingAddress = billingAddressSameAsShipping
        ? billingAddress
        : shippingAddress
      return (
        <ZarinpalCheckoutForm
          customerEmail={email || user?.email}
          billingAddress={billingAddress}
          shippingAddress={effectiveShippingAddress}
          cartTotal={cart.subtotal || 0}
          cartTotalIRT={subtotalIRT}
          setProcessingPayment={setProcessingPayment}
        />
      )
    }

    if (selectedPaymentMethod === 'stripe' && stripeClientSecret && stripe) {
      return (
        <Suspense fallback={<React.Fragment />}>
          {error && <p>{`${t('common.error', 'Error')}: ${error}`}</p>}
          <Elements
            options={{
              appearance: {
                theme: 'stripe',
                variables: {
                  borderRadius: '6px',
                  colorPrimary: '#858585',
                  gridColumnSpacing: '20px',
                  gridRowSpacing: '20px',
                  colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                  colorDanger: cssVariables.colors.error500,
                  colorDangerText: cssVariables.colors.error500,
                  colorIcon:
                    theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                  colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                  colorTextPlaceholder: '#858585',
                  fontFamily: 'Geist, sans-serif',
                  fontSizeBase: '16px',
                  fontWeightBold: '600',
                  fontWeightNormal: '500',
                  spacingUnit: '4px',
                },
              },
              clientSecret: stripeClientSecret,
            }}
            stripe={stripe}
          >
            <CheckoutForm
              customerEmail={email}
              billingAddress={billingAddress}
              setProcessingPayment={setProcessingPayment}
            />
          </Elements>
        </Suspense>
      )
    }

    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-col gap-8 my-8">
      {/* Header with Stepper */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">{t('checkout.title', 'Checkout')}</h1>
        <CheckoutStepper currentStep={currentStep} />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {error && currentStep !== 3 && (
            <div className="mb-6">
              <Message error={error} />
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  router.refresh()
                }}
                variant="default"
              >
                {t('common.tryAgain', 'Try again')}
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <ShippingAddressStep
              email={email}
              setEmail={setEmail}
              emailEditable={emailEditable}
              setEmailEditable={setEmailEditable}
              billingAddress={billingAddress}
              setBillingAddress={setBillingAddress}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              billingAddressSameAsShipping={billingAddressSameAsShipping}
              setBillingAddressSameAsShipping={setBillingAddressSameAsShipping}
              onNext={goToStep2}
            />
          )}

          {currentStep === 2 && (
            <PaymentMethodStep
              selectedMethod={selectedPaymentMethod}
              setSelectedMethod={setSelectedPaymentMethod}
              onNext={goToStep3}
              onBack={goBackToStep1}
            />
          )}

          {currentStep === 3 && (
            <ConfirmOrderStep
              billingAddress={billingAddress}
              shippingAddress={shippingAddress}
              billingAddressSameAsShipping={billingAddressSameAsShipping}
              selectedPaymentMethod={selectedPaymentMethod}
              onBack={goBackToStep2}
              onEditAddress={goBackToStep1}
              onEditPayment={goBackToStep2}
              paymentForm={renderPaymentForm()}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24 border">
            <h2 className="text-xl font-semibold mb-4">{t('cart.yourCart', 'Your cart')}</h2>

            <div className="flex flex-col gap-4">
              {cart?.items?.map((item, index) => {
                if (typeof item.product === 'object' && item.product) {
                  const {
                    product,
                    product: { id, meta, title, gallery },
                    quantity,
                    variant,
                  } = item

                  if (!quantity) return null

                  let image = gallery?.[0]?.image || meta?.image
                  let price = product?.priceInUSD
                  let priceIRT = product?.priceInIRT

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant) {
                    price = variant?.priceInUSD
                    priceIRT = variant?.priceInIRT

                    const imageVariant = product.gallery?.find((item) => {
                      if (!item.variantOption) return false
                      const variantOptionID =
                        typeof item.variantOption === 'object'
                          ? item.variantOption.id
                          : item.variantOption

                      const hasMatch = variant?.options?.some((option) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image !== 'string') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <div className="flex items-start gap-3" key={index}>
                      <div className="flex items-stretch justify-stretch h-16 w-16 p-1 rounded-md border shrink-0">
                        <div className="relative w-full h-full">
                          {image && typeof image !== 'string' && (
                            <Media fill imgClassName="rounded-md" resource={image} />
                          )}
                        </div>
                      </div>
                      <div className="flex grow justify-between items-center min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-medium text-sm truncate">{title}</p>
                          {variant && typeof variant === 'object' && (
                            <p className="text-xs font-mono text-primary/50 tracking-[0.1em]">
                              {variant.options
                                ?.map((option) => {
                                  if (typeof option === 'object') return option.label
                                  return null
                                })
                                .join(', ')}
                            </p>
                          )}
                          <span className="text-xs text-muted-foreground">x{quantity}</span>
                        </div>

                        {(typeof price === 'number' || typeof priceIRT === 'number') && (
                          <Price className="text-sm" amount={price} amountIRT={priceIRT} />
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>

            <hr className="my-4" />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('cart.subtotal', 'Subtotal')}</span>
                <Price amount={cart.subtotal || 0} amountIRT={subtotalIRT} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('cart.shipping', 'Shipping')}</span>
                <span>{t('cart.free', 'Free')}</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between items-center font-semibold text-base">
                <span>{t('cart.total', 'Total')}</span>
                <Price className="text-xl font-bold" amount={cart.subtotal || 0} amountIRT={subtotalIRT} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
