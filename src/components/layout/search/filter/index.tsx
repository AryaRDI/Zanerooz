import type { SortFilterItem } from '@/lib/constants'

import React, { Suspense } from 'react'

import { FilterItemDropdown } from './FilterItemDropdown'
import { FilterItem } from './FilterItem'
export type ListItem = PathFilterItem | SortFilterItem
export type PathFilterItem = { path: string; title: string }

function FilterItemList({ list }: { list: ListItem[] }) {
  return (
    <div className="space-y-2">
      {list.map((item: ListItem, i) => (
        <FilterItem item={item} key={i} />
      ))}
    </div>
  )
}

export function FilterList({ list, title }: { list: ListItem[]; title?: string }) {
  return (
    <nav>
      {title ? <h4 className="font-medium text-foreground mb-3">{title}</h4> : null}
      <div className="hidden md:block">
        <Suspense fallback={null}>
          <FilterItemList list={list} />
        </Suspense>
      </div>
      <div className="md:hidden">
        <Suspense fallback={null}>
          <FilterItemDropdown list={list} />
        </Suspense>
      </div>
    </nav>
  )
}
