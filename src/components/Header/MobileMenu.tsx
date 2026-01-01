'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { useTranslation } from '@/i18n/useTranslation'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface Props {
  menu: Header['navItems']
  brand?: Header['brand']
}

export function MobileMenu({ menu, brand }: Props) {
  const { user } = useAuth()
  const { t } = useTranslation()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const closeMobileMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger
        className="p-2 hover:bg-muted rounded-full transition-colors"
        aria-label={t('common.openMenu')}
      >
        <MenuIcon className="h-5 w-5 text-foreground" />
      </SheetTrigger>

      <SheetContent side="right" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>
            {brand?.name || 'مُد'}
            <span className="text-gradient-gold">{brand?.highlight || 'استایل'}</span>
          </SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2" key={item.id}>
                  <CMSLink
                    {...item.link}
                    appearance="inline"
                    className="block py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">{t('account.title')}</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders">{t('navigation.orders')}</Link>
              </li>
              <li>
                <Link href="/account/addresses">{t('account.addresses')}</Link>
              </li>
              <li>
                <Link href="/account">{t('account.manageAccount', 'Manage account')}</Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/logout">{t('navigation.logout')}</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">{t('account.title')}</h2>
            <div className="flex items-center gap-2 mt-4">
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">{t('navigation.login')}</Link>
              </Button>
              <span>{t('common.or', 'or')}</span>
              <Button asChild className="w-full">
                <Link href="/create-account">{t('navigation.createAccount')}</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
