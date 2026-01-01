'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { FormItem } from '@/components/forms/FormItem'
import { ZarinpalCheckoutForm } from '@/components/forms/ZarinpalCheckoutForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { cssVariables } from '@/cssVariables'
import { useTranslation } from '@/i18n/useTranslation'
import { Address } from '@/payload-types'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = apiKey ? loadStripe(apiKey) : null

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const { t } = useTranslation()
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'zarinpal'>('zarinpal')
  // Separate state for active payment form and Stripe-specific data
  const [activePaymentForm, setActivePaymentForm] = useState<'none' | 'zarinpal' | 'stripe'>('none')
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

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
        setActivePaymentForm('stripe')
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
    setActivePaymentForm('none')
    setStripeClientSecret(null)
  }, [])

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

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">{t('checkout.contact', 'Contact')}</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href="/login">{t('navigation.login')}</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">{t('common.or')}</span>
                <Link href="/create-account">{t('navigation.createAccount')}</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                {t('auth.notYou', 'Not you?')}{' '}
                <Link className="underline" href="/logout">
                  {t('navigation.logout')}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">
                {t('checkout.guestEmail', 'Enter your email to checkout as a guest.')}
              </p>

              <FormItem className="mb-6">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                {t('checkout.continueAsGuest', 'Continue as guest')}
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">{t('checkout.address', 'Address')}</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  disabled={activePaymentForm !== 'none'}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                >
                  {t('common.remove', 'Remove')}
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses heading={t('checkout.billingAddress')} setAddress={setBillingAddress} />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={activePaymentForm !== 'none' || (!user && (!email || emailEditable))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">
            {t('checkout.shippingSameAsBilling', 'Shipping is the same as billing')}
          </Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={activePaymentForm !== 'none'}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                    >
                      {t('common.remove', 'Remove')}
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading={t('checkout.shippingAddress')}
                description={t('checkout.selectShippingAddress', 'Please select a shipping address.')}
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        {activePaymentForm === 'none' && (
          <>
            <h2 className="font-medium text-3xl">{t('checkout.paymentMethod', 'Payment Method')}</h2>
            
            <div className="flex flex-col gap-4">
              {/* Payment method selection */}
              {process.env.NEXT_PUBLIC_ZARINPAL_ENABLED === 'true' && (
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPaymentMethod === 'zarinpal' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('zarinpal')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === 'zarinpal' ? 'border-primary' : 'border-border'
                    }`}>
                      {selectedPaymentMethod === 'zarinpal' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('checkout.zarinpal.title', 'Zarinpal')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.zarinpal.description', 'Secure payment with Iranian bank cards')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {stripe && (
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPaymentMethod === 'stripe' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('stripe')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === 'stripe' ? 'border-primary' : 'border-border'
                    }`}>
                      {selectedPaymentMethod === 'stripe' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{t('checkout.stripe.title', 'Stripe')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.stripe.description', 'International credit/debit cards')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="self-start"
              disabled={!canGoToPayment}
              onClick={(e) => {
                e.preventDefault()
                if (selectedPaymentMethod === 'stripe') {
                  void initiateStripePayment()
                } else {
                  setActivePaymentForm('zarinpal')
                }
              }}
            >
              {t('checkout.goToPayment', 'Go to payment')}
            </Button>
          </>
        )}

        {error && activePaymentForm !== 'stripe' && (
          <div className="my-8">
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

        {/* Zarinpal Payment Form */}
        {activePaymentForm === 'zarinpal' && (
          <div className="pb-16">
            <h2 className="font-medium text-3xl mb-6">{t('checkout.completePayment', 'Complete Payment')}</h2>
            <div className="flex flex-col gap-8">
              <ZarinpalCheckoutForm
                customerEmail={email || user?.email}
                billingAddress={billingAddress}
                cartTotal={cart.subtotal || 0}
                setProcessingPayment={setProcessingPayment}
              />
              <Button
                variant="ghost"
                className="self-start"
                onClick={cancelPayment}
              >
                {t('checkout.cancelPayment', 'Cancel payment')}
              </Button>
            </div>
          </div>
        )}

        {/* Stripe Payment Form */}
        {activePaymentForm === 'stripe' && stripeClientSecret && stripe && (
          <Suspense fallback={<React.Fragment />}>
            <div className="pb-16">
              <h2 className="font-medium text-3xl">{t('checkout.completePayment', 'Complete Payment')}</h2>
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
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="ghost"
                    className="self-start"
                    onClick={cancelPayment}
                  >
                    {t('checkout.cancelPayment', 'Cancel payment')}
                  </Button>
                </div>
              </Elements>
            </div>
          </Suspense>
        )}
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
          <h2 className="text-3xl font-medium">{t('cart.yourCart', 'Your cart')}</h2>
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
                <div className="flex items-start gap-4" key={index}>
                  <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                    <div className="relative w-full h-full">
                      {image && typeof image !== 'string' && (
                        <Media className="" fill imgClassName="rounded-lg" resource={image} />
                      )}
                    </div>
                  </div>
                  <div className="flex grow justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-lg">{title}</p>
                      {variant && typeof variant === 'object' && (
                        <p className="text-sm font-mono text-primary/50 tracking-[0.1em]">
                          {variant.options
                            ?.map((option) => {
                              if (typeof option === 'object') return option.label
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <div>
                        {'x'}
                        {quantity}
                      </div>
                    </div>

                    {(typeof price === 'number' || typeof priceIRT === 'number') && (
                      <Price amount={price} amountIRT={priceIRT} />
                    )}
                  </div>
                </div>
              )
            }
            return null
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">{t('cart.total', 'Total')}</span>{' '}
            <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
          </div>
        </div>
      )}
    </div>
  )
}
