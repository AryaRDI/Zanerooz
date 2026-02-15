'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/i18n/useTranslation'
import { Address } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React from 'react'

type Props = {
  email: string
  setEmail: (email: string) => void
  emailEditable: boolean
  setEmailEditable: (editable: boolean) => void
  billingAddress: Partial<Address> | undefined
  setBillingAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  shippingAddress: Partial<Address> | undefined
  setShippingAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  billingAddressSameAsShipping: boolean
  setBillingAddressSameAsShipping: (same: boolean) => void
  onNext: () => void
}

export const ShippingAddressStep: React.FC<Props> = ({
  email,
  setEmail,
  emailEditable,
  setEmailEditable,
  billingAddress,
  setBillingAddress,
  shippingAddress,
  setShippingAddress,
  billingAddressSameAsShipping,
  setBillingAddressSameAsShipping,
  onNext,
}) => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const canProceed = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Contact Info */}
      <h2 className="font-medium text-xl">{t('checkout.contact', 'Contact')}</h2>

      {!user && (
        <div className="bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
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
        <div className="bg-accent dark:bg-card rounded-lg p-4">
          <p>{user.email}</p>
          <p>
            {t('auth.notYou', 'Not you?')}{' '}
            <Link className="underline" href="/logout">
              {t('navigation.logout')}
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-accent dark:bg-black rounded-lg p-4">
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
              value={email}
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
      )}

      {/* Billing Address */}
      <h2 className="font-medium text-xl">{t('checkout.billingAddress', 'Billing Address')}</h2>

      {billingAddress ? (
        <div>
          <AddressItem
            actions={
              <Button
                variant="outline"
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

      {/* Shipping same as billing */}
      <div className="flex gap-4 items-center">
        <Checkbox
          id="shippingTheSameAsBilling"
          checked={billingAddressSameAsShipping}
          disabled={!user && (!email || emailEditable)}
          onCheckedChange={(state) => {
            setBillingAddressSameAsShipping(state as boolean)
          }}
        />
        <Label htmlFor="shippingTheSameAsBilling">
          {t('checkout.shippingSameAsBilling', 'Shipping is the same as billing')}
        </Label>
      </div>

      {/* Shipping Address (if different) */}
      {!billingAddressSameAsShipping && (
        <>
          <h2 className="font-medium text-xl">{t('checkout.shippingAddress', 'Shipping Address')}</h2>
          {shippingAddress ? (
            <div>
              <AddressItem
                actions={
                  <Button
                    variant="outline"
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

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="ghost">
          <Link href="/cart">{t('checkout.backToCart', 'Back to Cart')}</Link>
        </Button>
        <Button disabled={!canProceed} onClick={onNext}>
          {t('checkout.nextStep', 'Next Step')}
        </Button>
      </div>
    </div>
  )
}
