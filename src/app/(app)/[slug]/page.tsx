import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { homeStaticData } from '@/endpoints/seed/home-static'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import type { Page } from '@/payload-types'
import { getCachedGlobal, getLocaleFromCookies } from '@/utilities/getGlobals'
import { notFound } from 'next/navigation'
import HomePage from '../home/HomePage'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params
  const locale = await getLocaleFromCookies()
  const { isEnabled: draft } = await draftMode()

  let page = await queryPageBySlug({
    slug,
    draft,
    locale,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStaticData() as Page
  }

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  if (slug === 'home') {
    const [dict, footer] = await Promise.all([
      getDictionary(locale),
      getCachedGlobal('footer', 1, locale)(),
    ])

    const payload = await getPayload({ config: configPromise })

    const [categoryResult, productResult] = await Promise.all([
      payload.find({
        collection: 'categories',
        depth: 0,
        draft,
        limit: 8,
        locale,
        overrideAccess: draft,
        sort: '-createdAt',
      }),
      payload.find({
        collection: 'products',
        depth: 2,
        draft,
        limit: 8,
        locale,
        overrideAccess: draft,
        sort: '-createdAt',
        ...(draft
          ? {}
          : {
              where: {
                _status: {
                  equals: 'published',
                },
              },
            }),
      }),
    ])

    const categories = categoryResult?.docs || []
    const featuredProducts = productResult?.docs || []

    return (
      <HomePage
        categories={categories}
        dict={dict}
        featuredProducts={featuredProducts}
        footerBrand={footer?.brand}
        hero={hero}
        locale={locale}
      />
    )
  }

  return (
    <article className="pb-24">
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({
  slug,
  draft,
  locale,
}: {
  slug: string
  draft?: boolean
  locale?: Locale
}) => {
  const { isEnabled: draftFromMode } = await draftMode()
  const draftEnabled = typeof draft === 'boolean' ? draft : draftFromMode
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft: draftEnabled,
    limit: 1,
    locale,
    overrideAccess: draftEnabled,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draftEnabled ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
