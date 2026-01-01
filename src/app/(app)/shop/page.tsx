import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { sorting } from '@/lib/constants'
import { cn } from '@/utilities/cn'
import configPromise from '@payload-config'
import { ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload, Where } from 'payload'

export const metadata: Metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const formatNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value)

export default async function ShopPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const searchValue = normalizeParam(resolvedSearchParams.q)
  const sort = normalizeParam(resolvedSearchParams.sort)
  const viewParam = normalizeParam(resolvedSearchParams.view)
  const viewMode = viewParam === 'list' ? 'list' : 'grid'
  const categoryParam = resolvedSearchParams.category
  const categoryValues = categoryParam
    ? Array.isArray(categoryParam)
      ? categoryParam.filter(Boolean)
      : [categoryParam]
    : []

  const payload = await getPayload({ config: configPromise })

  const filters: Where[] = [
    {
      _status: {
        equals: 'published',
      },
    },
    ...(searchValue
      ? ([
          {
            or: [
              {
                title: {
                  like: searchValue,
                },
              },
              {
                description: {
                  like: searchValue,
                },
              },
            ],
          } satisfies Where,
        ] as Where[])
      : []),
    ...(categoryValues.length
      ? ([
          {
            categories: {
              in: categoryValues as string[],
            },
          },
        ] as Where[])
      : []),
  ]

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
      priceInIRT: true,
    },
    ...(sort ? { sort } : { sort: '-createdAt' }),
    where: {
      and: filters,
    },
  })

  const buildURL = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams()

    if (searchValue) params.set('q', searchValue)
    if (sort) params.set('sort', sort)
    if (viewParam) params.set('view', viewParam)
    if (categoryValues[0]) params.set('category', categoryValues[0])

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const query = params.toString()
    return query ? `/shop?${query}` : '/shop'
  }

  const currentSortLabel =
    sorting.find((s) => s.slug === sort)?.title || sorting[0]?.title || 'مرتب‌سازی'

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSortLabel}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {sorting.map((item) => (
                <DropdownMenuItem key={item.slug || 'default'} asChild>
                  <Link
                    href={buildURL({ sort: item.slug })}
                    className={cn(sort === item.slug && 'bg-accent')}
                  >
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 border border-border rounded-md p-1 bg-card">
            <Link
              href={buildURL({ view: 'grid' })}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground',
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Link>
            <Link
              href={buildURL({ view: 'list' })}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground',
              )}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <span className="text-muted-foreground text-sm">
          {formatNumber(products.docs.length)} محصول یافت شد
        </span>
      </div>

      {/* Products */}
      {products.docs.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          محصولی یافت نشد. فیلترها را تغییر دهید.
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {products.docs.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      )}
    </>
  )
}

type ProductCardProps = {
  product: {
    id?: string | number
    slug?: string
    title?: string | null
    gallery?: any
    categories?: any
    priceInUSD?: number | null
    priceInIRT?: number | null
    variants?: any
  }
  viewMode: 'grid' | 'list'
}

const ProductCard = ({ product, viewMode }: ProductCardProps) => {
  const { gallery, priceInUSD, priceInIRT, title, variants } = product

  let price = priceInUSD
  let priceIRT = priceInIRT

  if (variants?.docs?.length) {
    const variant = variants.docs.find((item: any) => item && typeof item === 'object')
    if (variant?.priceInUSD && typeof variant.priceInUSD === 'number') {
      price = variant.priceInUSD
    }
    if (variant?.priceInIRT && typeof variant.priceInIRT === 'number') {
      priceIRT = variant.priceInIRT
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : undefined

  const primaryCategory =
    Array.isArray(product.categories) && product.categories.length
      ? product.categories.find((cat: any) => cat && typeof cat === 'object')
      : undefined

  return (
    <Link
      className={cn(
        'bg-card rounded-lg overflow-hidden card-hover shadow-card group border',
        viewMode === 'list' ? 'flex' : '',
      )}
      href={`/products/${product.slug}`}
    >
      <div className={cn('relative', viewMode === 'list' ? 'w-48 h-full shrink-0' : 'h-64 w-full')}>
        {image ? (
          <Media
            fill
            className="absolute inset-0"
            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            resource={image}
          />
        ) : (
          <div className="bg-muted w-full h-full" />
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        {primaryCategory?.title && (
          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full shadow">
            {primaryCategory.title}
          </span>
        )}
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-medium text-foreground mt-1 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          {typeof price === 'number' || typeof priceIRT === 'number' ? (
            <Price className="font-bold text-foreground" amount={price} amountIRT={priceIRT} />
          ) : (
            <span className="text-sm text-muted-foreground">قیمت نامشخص</span>
          )}
        </div>
      </div>
    </Link>
  )
}
