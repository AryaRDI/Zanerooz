'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AddressForm } from '@/components/forms/AddressForm'
import { Address } from '@/payload-types'
import { DefaultDocumentIDType } from 'payload'
import { useTranslation } from '@/i18n/useTranslation'

type Props = {
  addressID?: DefaultDocumentIDType
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string }
  buttonText?: string
  modalTitle?: string
  callback?: (address: Partial<Address>) => void
  skipSubmission?: boolean
  disabled?: boolean
}

export const CreateAddressModal: React.FC<Props> = ({
  addressID,
  initialData,
  buttonText,
  modalTitle,
  callback,
  skipSubmission,
  disabled,
}) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const resolvedButtonText = buttonText ?? t('address.addNew', 'Add a new address')
  const resolvedModalTitle = modalTitle ?? t('address.addNew', 'Add a new address')

  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }

  const handleCallback = (data: Partial<Address>) => {
    closeModal()

    if (callback) {
      callback(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant={'outline'}>{resolvedButtonText}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resolvedModalTitle}</DialogTitle>
          <DialogDescription>{t('address.connectedToAccount', 'This address will be connected to your account.')}</DialogDescription>
        </DialogHeader>

        <AddressForm
          addressID={addressID}
          initialData={initialData}
          callback={handleCallback}
          skipSubmission={skipSubmission}
        />
      </DialogContent>
    </Dialog>
  )
}
