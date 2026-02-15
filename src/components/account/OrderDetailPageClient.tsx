'use client'

import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { useTranslation } from '@/i18n/useTranslation'
import { Order } from '@/payload-types'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { ProductItem } from '@/components/ProductItem'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'

type Props = {
  order: Order
  isLoggedIn: boolean
}

export const OrderDetailPageClient: React.FC<Props> = ({ order, isLoggedIn }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex gap-8 justify-between items-center mb-6">
        {isLoggedIn ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/orders">
                <ChevronLeftIcon />
                {t('orders.allOrders')}
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase font-mono px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span>{`${t('orders.orderPrefix')} #${order.id}`}</span>
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div>
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">
              {t('orders.orderDate')}
            </p>
            <p className="text-lg">
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
              </time>
            </p>
          </div>

          <div>
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{t('orders.total')}</p>
            {order.amount && <Price className="text-lg" amount={order.amount} />}
          </div>

          {order.status && (
            <div className="grow max-w-1/3">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">
                {t('orders.status')}
              </p>
              <OrderStatus className="text-sm" status={order.status} />
            </div>
          )}
        </div>

        {order.items && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {t('orders.items')}
            </h2>
            <ul className="flex flex-col gap-6">
              {order.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return <div key={index}>{t('orders.itemUnavailable')}</div>
                }

                const variant =
                  item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem
                      product={item.product}
                      quantity={item.quantity}
                      variant={variant}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {order.shippingAddress && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {t('orders.shippingAddress')}
            </h2>

            {/* @ts-expect-error - some kind of type hell */}
            <AddressItem address={order.shippingAddress} hideActions />
          </div>
        )}
      </div>
    </div>
  )
}
