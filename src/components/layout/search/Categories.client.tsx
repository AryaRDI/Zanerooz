'use client'
import React, { useCallback, useMemo } from 'react'

import { Category } from '@/payload-types'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/utilities/cn'

type Props = {
  category: Category | { id: string; title: string }
  isAll?: boolean
}

export const CategoryItem: React.FC<Props> = ({ category, isAll = false }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    if (isAll) {
      return !searchParams.get('category')
    }
    return searchParams.get('category') === String(category.id)
  }, [category.id, searchParams, isAll])

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isAll || isActive) {
      params.delete('category')
    } else {
      params.set('category', String(category.id))
    }

    const newParams = params.toString()

    router.push(pathname + (newParams ? '?' + newParams : ''))
  }, [category.id, isActive, pathname, router, searchParams, isAll])

  return (
    <button
      onClick={() => setQuery()}
      className={cn(
        'block w-full text-right px-3 py-2 rounded-md transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {category.title}
    </button>
  )
}
