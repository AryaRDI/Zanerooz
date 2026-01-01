import { getCachedGlobal, getLocaleFromCookies } from '@/utilities/getGlobals'

import './index.css'
import { HeaderClient } from './index.client'
import { getDictionary } from '@/i18n/getDictionary'

export async function Header() {
  const locale = await getLocaleFromCookies()
  const header = await getCachedGlobal('header', 1, locale)()

  const dict = await getDictionary(locale)

  return (
    <HeaderClient
      header={header}
      labels={{
        search: dict.common.search,
        account: dict.navigation.account,
        menu: dict.common.openMenu,
      }}
    />
  )
}
