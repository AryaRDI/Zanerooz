'use client'

import { AccountForm } from '@/components/forms/AccountForm'
import { OrderItem } from '@/components/OrderItem'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/useTranslation'
import { Order } from '@/payload-types'
import Link from 'next/link'

type Props = {
  orders: Order[] | null
}

export const AccountPageClient: React.FC<Props> = ({ orders }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="bg-card border rounded-lg p-8">
        <h1 className="text-3xl font-medium mb-8">{t('account.settingsTitle')}</h1>
        <AccountForm />
      </div>

      <div className="bg-card border rounded-lg p-8">
        <h2 className="text-3xl font-medium mb-8">{t('account.recentOrders')}</h2>

        <div className="prose dark:prose-invert mb-8">
          <p>{t('account.recentOrdersDesc')}</p>
        </div>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="mb-8">{t('account.noOrders')}</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6 mb-8">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="default">
          <Link href="/orders">{t('account.viewAllOrders')}</Link>
        </Button>
      </div>
    </>
  )
}
