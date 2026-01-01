export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'الفبایی الف-ی',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'جدیدترین‌ها' },
  { slug: 'priceInUSD', reverse: false, title: 'قیمت: کم به زیاد' }, // asc
  { slug: '-priceInUSD', reverse: true, title: 'قیمت: زیاد به کم' },
]
