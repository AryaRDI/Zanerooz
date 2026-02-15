'use client'

import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { useTranslation } from '@/i18n/useTranslation'

export const AddressesPageClient: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="bg-card border rounded-lg p-8">
      <h1 className="text-3xl font-medium mb-8">{t('account.addresses')}</h1>

      <div className="mb-8">
        <AddressListing />
      </div>

      <CreateAddressModal />
    </div>
  )
}
