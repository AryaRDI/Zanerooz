import { Categories } from '@/components/layout/search/Categories'
import { Filter } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Page Header */}
      <section className="bg-card py-10 md:py-12 border-b">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            محصولات
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              صفحه اصلی
            </Link>
            <span>/</span>
            <span className="text-foreground">محصولات</span>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <section className="section-padding">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - FIRST in flex order = RIGHT side in RTL */}
              <aside className="lg:w-64 shrink-0">
                <div className="bg-card rounded-lg p-6 shadow-card lg:sticky lg:top-24 border">
                  <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    فیلترها
                  </h3>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">دسته‌بندی</h4>
                      <Categories />
                    </div>

                    {/* Brand Filter - placeholder for now */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-medium text-foreground mb-3">برند</h4>
                      <div className="space-y-2">
                        <button className="block w-full text-right px-3 py-2 rounded-md transition-colors bg-accent text-accent-foreground">
                          همه
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content - SECOND in flex order = LEFT side in RTL */}
              <div className="flex-1">{children}</div>
            </div>
          </div>
        </section>
      </Suspense>
    </>
  )
}
