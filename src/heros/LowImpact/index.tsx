import React from 'react'

import type { Page } from '@/payload-types'

import { RichText } from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-l from-background via-cream/60 to-background" />
      </div>

      <div className="relative z-10 section-padding">
        <div className="container mx-auto">
          <div
            className="max-w-2xl"
            style={{
              textAlign: 'start', // respects document dir
              marginInlineEnd: 'auto',
            }}
          >
            {children || (richText && <RichText data={richText} enableGutter={false} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
