import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInUSD, priceInIRT, title } = product

  let price = priceInUSD
  let priceIRT = priceInIRT

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object') {
      if (variant?.priceInUSD && typeof variant.priceInUSD === 'number') {
        price = variant.priceInUSD
      }
      if (variant?.priceInIRT && typeof variant.priceInIRT === 'number') {
        priceIRT = variant.priceInIRT
      }
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <Link className="group block" href={`/products/${product.slug}`}>
      <div className="bg-background rounded-lg overflow-hidden shadow-card card-hover">
        <div className="relative aspect-[4/5] overflow-hidden">
          {image ? (
            <Media
              fill
              className="absolute inset-0"
              imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              priority={false}
              resource={image}
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-1">{title}</h3>
          <div className="flex items-center justify-between gap-2">
            {typeof price === 'number' || typeof priceIRT === 'number' ? (
              <span className="font-bold text-accent">
                <Price amount={price} amountIRT={priceIRT} />
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
            <span className="text-xs text-muted-foreground">مشاهده ←</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
