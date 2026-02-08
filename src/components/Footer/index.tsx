import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getDictionary } from '@/i18n/getDictionary'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal, getLocaleFromCookies } from '@/utilities/getGlobals'
import { Instagram, MessageCircle, Twitter } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const locale = await getLocaleFromCookies()
  const footer: Footer = await getCachedGlobal('footer', 1, locale)()
  const dict = await getDictionary(locale)
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700'

  const copyrightName = COMPANY_NAME || SITE_NAME || ''
  const brandName = footer?.brand?.name || SITE_NAME || ''
  const brandHighlight = footer?.brand?.highlight || ''
  const brandDescription = footer?.brand?.description || ''

  const social = footer?.socialLinks || []
  const badges = footer?.badges || []

  return (
    <footer className="bg-charcoal text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link className="text-2xl font-bold mb-4 block" href="/">
              {brandName}
              {brandHighlight ? <span className="text-gold">{brandHighlight}</span> : null}
              <span className="sr-only">{SITE_NAME}</span>
            </Link>
            {brandDescription ? (
              <p className="text-primary-foreground/70 text-sm mb-6">{brandDescription}</p>
            ) : null}
            <div className="flex gap-4">
              {social.map((item) => {
                const href = item.url
                if (!href) return null

                const icon =
                  item.platform === 'instagram' ? (
                    <Instagram className="w-5 h-5" />
                  ) : item.platform === 'twitter' ? (
                    <Twitter className="w-5 h-5" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )

                const ariaLabel =
                  item.platform === 'instagram'
                    ? dict.footer.social.instagram
                    : item.platform === 'twitter'
                      ? dict.footer.social.twitter
                      : dict.footer.social.whatsapp

                return (
                  <a
                    key={item.id}
                    href={href}
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-gold transition-colors"
                    aria-label={ariaLabel}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {icon}
                  </a>
                )
              })}
            </div>
          </div>

          {/* CMS Footer Menu */}
          <div className="md:col-span-2">
            <Suspense
              fallback={
                <div className="flex h-[188px] w-full max-w-[300px] flex-col gap-2">
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                </div>
              }
            >
              <FooterMenu
                groups={footer.linkGroups}
                menu={menu}
                fallbackGroupTitle={dict.footer.groups.links}
              />
            </Suspense>
          </div>

          {/* Controls */}
          <div className="md:col-span-1 flex flex-col gap-4 items-end">
            <LanguageSwitcher />
            <ThemeSelector />
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} {dict.footer.allRightsReserved}.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {badges.length ? (
              <div className="flex gap-6 text-sm text-primary-foreground/50">
                {badges.map((badge) => (
                  <span key={badge.id}>{badge.label}</span>
                ))}
              </div>
            ) : null}
            <a
              referrerPolicy="origin"
              target="_blank"
              href="https://trustseal.enamad.ir/?id=5618515&Code=OzGgSBB6ldlX60phqh57af17KEIHHN2d"
              rel="noopener noreferrer"
              aria-label="Enamad trust seal"
              className="inline-flex items-center"
              data-code="OzGgSBB6ldlX60phqh57af17KEIHHN2d"
            >
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=5618515&Code=OzGgSBB6ldlX60phqh57af17KEIHHN2d"
                alt="Enamad trust seal"
                className="h-10 w-auto cursor-pointer"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
