import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { ProductGridItem } from '@/components/ProductGridItem'
import { RichText } from '@/components/RichText'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/getDictionary'
import type { Category, Footer, Page, Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import {
  Gem,
  Glasses,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  Watch,
} from 'lucide-react'
import React from 'react'

type Props = {
  categories: Category[]
  dict: Dictionary
  featuredProducts: Product[]
  footerBrand?: Footer['brand']
  hero: Page['hero']
  locale: Locale
}

const brandFallbacks = ['GUCCI', 'PRADA', 'CHANEL', 'DIOR', 'LOUIS VUITTON', 'BURBERRY']
const categoryGradients = [
  'from-pink-500/15 to-rose-500/10',
  'from-blue-500/15 to-indigo-500/10',
  'from-amber-500/20 to-orange-500/10',
  'from-emerald-500/15 to-teal-500/10',
]

const categoryIcons = [Shirt, Watch, Gem, Glasses]

const featureCards = (dict: Dictionary) => [
  {
    description: dict.home.features.authenticDesc,
    Icon: ShieldCheck,
    title: dict.home.features.authentic,
  },
  {
    description: dict.home.features.shippingDesc,
    Icon: Truck,
    title: dict.home.features.shipping,
  },
  {
    description: dict.home.features.stylingDesc,
    Icon: Sparkles,
    title: dict.home.features.styling,
  },
]

const NewsletterSection = ({ dict, isRTL }: { dict: Dictionary; isRTL: boolean }) => (
  <section className="section-padding">
    <div className="container">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cream via-background to-card p-10 md:p-12 shadow-card">
        <div className="absolute inset-0 opacity-40">
          <div
            className={cn(
              'absolute -top-10 h-40 w-40 rounded-full bg-gold blur-3xl',
              isRTL ? '-right-10' : '-left-10',
            )}
          />
          <div
            className={cn(
              'absolute bottom-0 h-40 w-40 rounded-full bg-amber-200 blur-3xl',
              isRTL ? '-left-10' : '-right-10',
            )}
          />
        </div>
        <div
          className={cn(
            'relative z-10 flex flex-col gap-6 md:items-center md:justify-between',
            isRTL ? 'md:flex-row-reverse' : 'md:flex-row',
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className={cn('max-w-xl space-y-3', isRTL ? 'text-right' : 'text-left')}>
            <p className="text-sm font-medium text-accent">{dict.home.sections.newsletterTitle}</p>
            <h3 className="text-3xl font-bold text-foreground">{dict.home.newsletter.cta}</h3>
            <p className="text-muted-foreground">{dict.home.sections.newsletterSubtitle}</p>
          </div>
          <div
            className={cn(
              'flex flex-wrap gap-3',
              isRTL ? 'flex-row-reverse justify-end' : 'flex-row justify-start',
            )}
          >
            <CMSLink
              appearance="inline"
              className="btn-gold inline-flex items-center justify-center"
              url="/create-account"
              label={dict.home.newsletter.button}
            />
            <CMSLink
              appearance="inline"
              className="px-6 py-3 text-foreground transition-colors duration-300 hover:text-accent"
              url="/shop"
              label={dict.home.sections.shopAll}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
)

const FeatureHighlights = ({ dict }: { dict: Dictionary }) => {
  const features = featureCards(dict)

  return (
    <section className="section-padding">
      <div className="container">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {dict.home.sections.featuresTitle}{' '}
            <span className="text-gradient-gold">{dict.home.sections.featuresAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict.home.sections.featuresSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-lg border bg-card/80 p-6 shadow-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <feature.Icon className="h-10 w-10 text-accent" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeaturedProductsSection = ({
  dict,
  products,
  isRTL,
}: {
  dict: Dictionary
  products: Product[]
  isRTL: boolean
}) => {
  if (!products?.length) return null

  return (
    <section className="section-padding bg-card" id="products">
      <div className="container">
        <div
          className={cn(
            'flex flex-col md:items-end md:justify-between mb-12 gap-4',
            isRTL ? 'md:flex-row-reverse' : 'md:flex-row',
          )}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {dict.home.sections.featuredTitle}{' '}
              <span className="text-gradient-gold">{dict.home.sections.featuredAccent}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {dict.home.sections.featuredSubtitle}
            </p>
          </div>
          <CMSLink
            appearance="inline"
            className="text-accent hover:text-accent/80 font-medium transition-colors"
            url="/shop"
            label={dict.home.sections.shopAll}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div key={product.id ?? product.slug ?? index} className="animate-fade-in">
              <ProductGridItem product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const CategoryShowcase = ({
  categories,
  dict,
  isRTL,
}: {
  categories: Category[]
  dict: Dictionary
  isRTL: boolean
}) => {
  const fallbackCategories: Pick<Category, 'title' | 'slug'>[] = brandFallbacks
    .slice(0, 4)
    .map((brand) => ({ title: brand, slug: brand.toLowerCase() }))

  const usableCategories = categories?.length ? categories.slice(0, 4) : fallbackCategories

  return (
    <section className="section-padding">
      <div className="container" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {dict.home.sections.categoriesTitle}{' '}
            <span className="text-gradient-gold">{dict.home.sections.categoriesAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {dict.home.sections.categoriesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usableCategories.map((category, index) => {
            const IconComponent = categoryIcons[index % categoryIcons.length]
            const gradient = categoryGradients[index % categoryGradients.length]
            const key = `category-${'id' in category ? category.id : category.slug ?? index}`
            const href =
              'slug' in category && category.slug
                ? `/shop?category=${encodeURIComponent(category.slug)}`
                : undefined

            return (
              <div
                key={key}
                className={cn(
                  'group relative overflow-hidden rounded-lg bg-gradient-to-br p-8 card-hover',
                  gradient,
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={cn(
                    'absolute top-4 w-12 h-12 bg-background/80 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300',
                    isRTL ? 'right-4' : 'left-4',
                  )}
                >
                  <IconComponent className="w-6 h-6 text-foreground group-hover:text-accent-foreground transition-colors" />
                </div>
                <div className="mt-16">
                  <h3 className="text-xl font-bold text-foreground mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dict.home.sections.categoriesSubtitle}
                  </p>
                </div>
                {href ? (
                  <CMSLink
                    appearance="inline"
                    className={cn(
                      'absolute bottom-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium',
                      isRTL ? 'right-4' : 'left-4',
                    )}
                    url={href}
                    label={dict.home.sections.shopAll}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const BrandsSection = ({ categories, dict }: { categories: Category[]; dict: Dictionary }) => {
  const brands =
    categories?.length > 0
      ? categories.slice(0, 6).map((category) => ({
          title: category.title,
          secondary: category.slug?.replace(/-/g, ' ').toUpperCase(),
        }))
      : brandFallbacks.map((brand) => ({
          secondary: brand,
          title: brand,
        }))

  return (
    <section className="section-padding bg-card" id="brands">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {dict.home.sections.brandsTitle}{' '}
            <span className="text-gradient-gold">{dict.home.sections.brandsAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {dict.home.sections.brandsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand, index) => (
            <div
              key={`${brand.title}-${index}`}
              className="group bg-background p-6 md:p-8 flex flex-col items-center justify-center text-center rounded-sm shadow-card card-hover"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <span className="text-lg md:text-xl font-semibold text-foreground/70 tracking-widest group-hover:text-accent transition-colors duration-300">
                {brand.secondary || brand.title}
              </span>
              <span className="text-xs text-muted-foreground mt-2">{brand.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HomeHero = ({
  brand,
  dict,
  hero,
  isRTL,
}: {
  brand?: Footer['brand']
  dict: Dictionary
  hero: Page['hero']
  isRTL: boolean
}) => {
  const primaryLink = hero?.links?.[0]?.link
  const secondaryLink = hero?.links?.[1]?.link
  // Center the stack; copy aligns center in both locales for the hero
  const textAlignClass = 'text-center'
  const alignClass = 'text-center mx-auto'

  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-4 md:pt-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0">
        {hero?.media && typeof hero.media === 'object' ? (
          <Media
            fill
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover scale-105"
            priority
            resource={hero.media}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-background to-card" />
        )}
        <div
          className={cn(
            'absolute inset-0 from-background/90 via-background/60 to-background/30',
            isRTL ? 'bg-gradient-to-r' : 'bg-gradient-to-l',
          )}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <div className={cn('max-w-2xl space-y-5', alignClass)}>
          <span className="inline-block text-sm md:text-base text-accent font-medium animate-fade-in">
            {brand?.name ? (
              <>
                {brand.name} {brand.highlight ? <span className="text-gradient-gold">{brand.highlight}</span> : null}
              </>
            ) : (
              dict.home.hero.season
            )}
          </span>
          {hero?.richText ? (
            <RichText
              className={cn(
                'animate-slide-up prose-h1:text-4xl md:prose-h1:text-6xl lg:prose-h1:text-7xl prose-p:text-lg md:prose-p:text-xl prose-headings:font-bold prose-p:text-muted-foreground max-w-xl',
                textAlignClass,
              )}
              data={hero.richText}
              dir={isRTL ? 'rtl' : 'ltr'}
              enableGutter={false}
            />
          ) : (
            <h1
              className={cn(
                'text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight animate-slide-up text-center'
              )}
            >
              <span className="block">{dict.home.sections.featuredTitle}</span>
              <span className="text-gradient-gold">{dict.home.sections.categoriesTitle}</span>
            </h1>
          )}
          <div
            className={cn(
              'flex flex-wrap gap-4 animate-slide-up justify-center',
              isRTL ? 'flex-row-reverse' : 'flex-row',
            )}
          >
            {primaryLink ? (
              <CMSLink
                {...primaryLink}
                label={primaryLink.label || dict.home.hero.primaryCta}
                appearance="inline"
                className="btn-gold inline-flex items-center justify-center"
              />
            ) : (
              <CMSLink
                appearance="inline"
                className="btn-gold inline-flex items-center justify-center"
                url="/shop"
                label={dict.home.hero.primaryCta}
              />
            )}
            {secondaryLink ? (
              <CMSLink
                {...secondaryLink}
                label={secondaryLink.label || dict.home.hero.secondaryCta}
                appearance="inline"
                className="px-8 py-3 border border-foreground/20 text-foreground hover:bg-foreground/5 rounded-sm font-medium transition-all duration-300"
              />
            ) : (
              <CMSLink
                appearance="inline"
                className="px-8 py-3 border border-foreground/20 text-foreground hover:bg-foreground/5 rounded-sm font-medium transition-all duration-300"
                url="#brands"
                label={dict.home.hero.secondaryCta}
              />
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-accent rounded-full" />
        </div>
      </div>
    </section>
  )
}

const HomePage: React.FC<Props> = ({
  categories,
  dict,
  featuredProducts,
  footerBrand,
  hero,
  locale,
}) => {
  const isRTL = locale === 'fa'

  return (
    <article className="pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <HomeHero brand={footerBrand} dict={dict} hero={hero} isRTL={isRTL} />
      <BrandsSection categories={categories} dict={dict} />
      <CategoryShowcase categories={categories} dict={dict} isRTL={isRTL} />
      <FeaturedProductsSection dict={dict} products={featuredProducts} isRTL={isRTL} />
      <FeatureHighlights dict={dict} />
      <NewsletterSection dict={dict} isRTL={isRTL} />
    </article>
  )
}

export default HomePage
