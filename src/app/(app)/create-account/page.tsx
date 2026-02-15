import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { getDictionary } from '@/i18n/getDictionary'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getLocaleFromCookies } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies()
  const dict = await getDictionary(locale)

  return {
    description: dict.auth.createAccountDescription,
    openGraph: mergeOpenGraph({
      title: dict.navigation.createAccount,
      url: '/create-account',
    }),
    title: dict.navigation.createAccount,
  }
}

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocaleFromCookies()
  const dict = await getDictionary(locale)

  if (user) {
    redirect(`/account?warning=${encodeURIComponent(dict.auth.alreadyLoggedIn)}`)
  }

  return (
    <div className="container py-16">
      <h1 className="text-xl mb-4">{dict.navigation.createAccount}</h1>
      <RenderParams />
      <CreateAccountForm />
    </div>
  )
}
