import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { CartPage } from '@/components/Cart/CartPage'

export default function Cart() {
  return (
    <div className="container min-h-[90vh] py-8">
      <CartPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Your shopping cart.',
  openGraph: mergeOpenGraph({
    title: 'Cart',
    url: '/cart',
  }),
  title: 'Cart',
}
