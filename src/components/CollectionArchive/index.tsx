import { cn } from '@/utilities/cn'
import React from 'react'

import type { Product } from '@/payload-types'
import { ProductGridItem } from '@/components/ProductGridItem'

/* import { Card } from '../Card' */

export type Props = {
  posts: Product[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <ProductGridItem key={index} product={result} />
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
