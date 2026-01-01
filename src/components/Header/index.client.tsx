'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from 'src/payload-types'

import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { Menu, Search, User } from 'lucide-react'

type Props = {
  header: Header
  labels: {
    search: string
    account: string
    menu: string
  }
}

export function HeaderClient({ header, labels }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-foreground tracking-wide"
          >
            {header?.brand?.name || 'مُد'}
            <span className="text-gradient-gold">{header?.brand?.highlight || 'استایل'}</span>
          </Link>

          {/* Desktop Navigation */}
          {menu.length ? (
            <nav className="hidden lg:flex items-center gap-8">
              {menu.map((item) => (
                <CMSLink
                  key={item.id}
                  {...item.link}
                  className={cn(
                    'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200',
                    {
                      'text-foreground': item.link.url
                        ? item.link.url !== '/'
                          ? pathname.includes(item.link.url)
                          : pathname === '/'
                        : false,
                    },
                  )}
                  appearance="inline"
                />
              ))}
            </nav>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              aria-label={labels.search}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-foreground" />
            </Link>

            <Link
              href="/account"
              aria-label={labels.account}
              className="p-2 hover:bg-muted rounded-full transition-colors hidden md:flex"
            >
              <User className="w-5 h-5 text-foreground" />
            </Link>

            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>

            <div className="lg:hidden">
              <Suspense
                fallback={
                  <button
                    aria-label={labels.menu}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    type="button"
                  >
                    <Menu className="w-5 h-5 text-foreground" />
                  </button>
                }
              >
                <MobileMenu brand={header?.brand} menu={menu} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
