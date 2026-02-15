'use client'

import { OrderItem } from '@/components/OrderItem'
import { useTranslation } from '@/i18n/useTranslation'
import { Order } from '@/payload-types'

type Props = {
  orders: Order[] | null
}

export const OrdersPageClient: React.FC<Props> = ({ orders }) => {
  const { t } = useTranslation()

  return (
    <div className="bg-card border rounded-lg p-8 w-full">
      <h1 className="text-3xl font-medium mb-8">{t('orders.title')}</h1>
      {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
        <p>{t('orders.noOrders')}</p>
      )}

      {orders && orders.length > 0 && (
        <ul className="flex flex-col gap-6">
          {orders?.map((order) => (
            <li key={order.id}>
              <OrderItem order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
