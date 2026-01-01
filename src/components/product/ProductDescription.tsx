'use client'
import type { Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import { Suspense } from 'react'

import { StockIndicator } from '@/components/product/StockIndicator'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { Heart, RotateCcw, Share2, Shield, Truck } from 'lucide-react'
import { VariantSelector } from './VariantSelector'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    amountIRT: number | null = null,
    lowestAmount = 0,
    lowestAmountIRT: number | null = null,
    highestAmount = 0,
    highestAmountIRT: number | null = null
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1]
    
    if (variantsOrderedByPrice) {
      if (typeof lowestVariant[priceField] === 'number') {
        lowestAmount = lowestVariant[priceField]
      }
      if (typeof highestVariant[priceField] === 'number') {
        highestAmount = highestVariant[priceField]
      }
      // Get IRT prices for range
      if (typeof lowestVariant.priceInIRT === 'number') {
        lowestAmountIRT = lowestVariant.priceInIRT
      }
      if (typeof highestVariant.priceInIRT === 'number') {
        highestAmountIRT = highestVariant.priceInIRT
      }
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
    if (typeof product.priceInIRT === 'number') {
      amountIRT = product.priceInIRT
    }
  }

  const primaryCategory =
    Array.isArray(product.categories) && product.categories.length
      ? product.categories.find((cat) => cat && typeof cat === 'object')
      : undefined

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {primaryCategory && typeof primaryCategory === 'object' && primaryCategory.title ? (
          <span className="text-xs text-accent font-semibold tracking-wider">
            {primaryCategory.title}
          </span>
        ) : null}
        <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-3xl font-bold text-foreground">
          {hasVariants ? (
            <Price
              highestAmount={highestAmount}
              highestAmountIRT={highestAmountIRT}
              lowestAmount={lowestAmount}
              lowestAmountIRT={lowestAmountIRT}
            />
          ) : (
            <Price amount={amount} amountIRT={amountIRT} />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <Suspense fallback={<span>...</span>}>
            <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-accent-foreground border border-accent/30">
              <StockIndicator product={product} />
            </div>
          </Suspense>
        </div>
      </div>

      {product.description ? (
        <RichText
          className="prose prose-neutral max-w-none text-muted-foreground"
          data={product.description}
          enableGutter={false}
        />
      ) : null}

      {hasVariants && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h3 className="font-semibold text-foreground">انتخاب ویژگی</h3>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Suspense fallback={null}>
          <AddToCart className="flex-1 h-12 btn-gold" product={product} variant="default">
            افزودن به سبد خرید
          </AddToCart>
        </Suspense>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <Truck className="w-6 h-6 mx-auto text-accent mb-2" />
          <span className="text-xs text-muted-foreground">ارسال رایگان</span>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 mx-auto text-accent mb-2" />
          <span className="text-xs text-muted-foreground">ضمانت اصالت</span>
        </div>
        <div className="text-center">
          <RotateCcw className="w-6 h-6 mx-auto text-accent mb-2" />
          <span className="text-xs text-muted-foreground">۷ روز مرجوعی</span>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-3 border">
        <h3 className="font-medium text-foreground">مشخصات محصول</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-muted-foreground">دسته‌بندی:</div>
          <div className="text-foreground">
            {primaryCategory && typeof primaryCategory === 'object' ? primaryCategory.title : '—'}
          </div>
          <div className="text-muted-foreground">شناسه:</div>
          <div className="text-foreground break-all">{product.slug || product.id}</div>
        </div>
      </div>
    </div>
  )
}
