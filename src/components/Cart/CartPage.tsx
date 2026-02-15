'use client'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/useTranslation'
import { Product } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'

export const CartPage: React.FC = () => {
  const { cart } = useCart()
  const { t } = useTranslation()

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  if (cartIsEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/50" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('cart.emptyTitle', 'Your cart is empty')}</h2>
          <p className="text-muted-foreground">{t('cart.emptyDesc', 'Add products to your cart')}</p>
        </div>
        <Button asChild>
          <Link href="/products">{t('cart.viewProducts', 'View Products')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('navigation.home', 'Home')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('navigation.cart', 'Cart')}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">{t('cart.title', 'Shopping Cart')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart?.items?.map((item, index) => {
            const product = item.product
            const variant = item.variant

            if (typeof product !== 'object' || !product || !product.slug) return null

            const metaImage =
              product.meta?.image && typeof product.meta?.image === 'object'
                ? product.meta.image
                : undefined

            const firstGalleryImage =
              typeof product.gallery?.[0]?.image === 'object'
                ? product.gallery?.[0]?.image
                : undefined

            let image = firstGalleryImage || metaImage
            let price = product.priceInUSD
            let priceIRT = product.priceInIRT

            const isVariant = Boolean(variant) && typeof variant === 'object'

            if (isVariant && variant && typeof variant === 'object') {
              price = variant.priceInUSD
              priceIRT = variant.priceInIRT

              const imageVariant = product.gallery?.find((galleryItem) => {
                if (!galleryItem.variantOption) return false
                const variantOptionID =
                  typeof galleryItem.variantOption === 'object'
                    ? galleryItem.variantOption.id
                    : galleryItem.variantOption

                const hasMatch = variant?.options?.some((option) => {
                  if (typeof option === 'object') return option.id === variantOptionID
                  else return option === variantOptionID
                })

                return hasMatch
              })

              if (imageVariant && typeof imageVariant.image === 'object') {
                image = imageVariant.image
              }
            }

            return (
              <div
                key={index}
                className="flex items-start gap-4 border rounded-lg p-4 bg-card"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${(product as Product).slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted"
                >
                  {image && typeof image !== 'string' && (
                    <Media fill imgClassName="object-cover rounded-md" resource={image} />
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <Link
                    href={`/products/${(product as Product).slug}`}
                    className="font-medium text-lg hover:underline truncate"
                  >
                    {product.title}
                  </Link>

                  {isVariant && variant && typeof variant === 'object' && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {variant.options
                        ?.map((option) => {
                          if (typeof option === 'object') return option.label
                          return null
                        })
                        .join(', ')}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center rounded-lg border h-9">
                      <EditItemQuantityButton item={item} type="minus" />
                      <p className="w-8 text-center text-sm">{item.quantity}</p>
                      <EditItemQuantityButton item={item} type="plus" />
                    </div>
                    <div className="ml-2">
                      <DeleteItemButton item={item} />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  {(typeof price === 'number' || typeof priceIRT === 'number') && (
                    <Price amount={price} amountIRT={priceIRT} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24 border">
            <h2 className="text-xl font-semibold mb-4">{t('checkout.orderSummary', 'Order Summary')}</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('cart.subtotal', 'Subtotal')}</span>
                <Price amount={cart.subtotal || 0} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('cart.shipping', 'Shipping')}</span>
                <span className="text-sm">{t('cart.free', 'Free')}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center font-semibold text-base">
                <span>{t('cart.total', 'Total')}</span>
                <Price className="text-xl font-bold" amount={cart.subtotal || 0} />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">{t('cart.proceedCheckout', 'Proceed to Checkout')}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/products">{t('cart.continueShopping', 'Continue Shopping')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
