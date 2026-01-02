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
import { ChevronDown, ChevronLeft, ChevronRight, Grid3X3, LayoutList } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload, Where } from 'payload'

const PRODUCTS_PER_PAGE = 12

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
  const pageParam = normalizeParam(resolvedSearchParams.page)
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1)
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
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
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

  const { totalDocs, totalPages, hasNextPage, hasPrevPage } = products

  const buildURL = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams()

    if (searchValue) params.set('q', searchValue)
    if (sort) params.set('sort', sort)
    if (viewParam) params.set('view', viewParam)
    if (categoryValues[0]) params.set('category', categoryValues[0])
    // Preserve current page unless explicitly updating it
    if (currentPage > 1 && !('page' in updates)) params.set('page', String(currentPage))

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

  // Generate page numbers to display (max 5 pages centered around current)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
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
          {formatNumber(totalDocs)} محصول یافت شد
        </span>
      </div>

      {/* Products */}
      {products.docs.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          محصولی یافت نشد. فیلترها را تغییر دهید.
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-10" aria-label="صفحه‌بندی">
              {/* Previous */}
              {hasPrevPage ? (
                <Link
                  href={buildURL({ page: String(currentPage - 1) })}
                  className="p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  aria-label="صفحه قبل"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <span className="p-2 rounded-md border border-border bg-muted/50 text-muted-foreground cursor-not-allowed">
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}

              {/* First page + ellipsis */}
              {getPageNumbers()[0] > 1 && (
                <>
                  <Link
                    href={buildURL({ page: '1' })}
                    className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted transition-colors text-sm"
                  >
                    {formatNumber(1)}
                  </Link>
                  {getPageNumbers()[0] > 2 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                </>
              )}

              {/* Page numbers */}
              {getPageNumbers().map((page) => (
                <Link
                  key={page}
                  href={buildURL({ page: String(page) })}
                  className={cn(
                    'px-3 py-2 rounded-md border text-sm transition-colors',
                    page === currentPage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-card hover:bg-muted',
                  )}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {formatNumber(page)}
                </Link>
              ))}

              {/* Last page + ellipsis */}
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Link
                    href={buildURL({ page: String(totalPages) })}
                    className="px-3 py-2 rounded-md border border-border bg-card hover:bg-muted transition-colors text-sm"
                  >
                    {formatNumber(totalPages)}
                  </Link>
                </>
              )}

              {/* Next */}
              {hasNextPage ? (
                <Link
                  href={buildURL({ page: String(currentPage + 1) })}
                  className="p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  aria-label="صفحه بعد"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <span className="p-2 rounded-md border border-border bg-muted/50 text-muted-foreground cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </span>
              )}
            </nav>
          )}
        </>
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
