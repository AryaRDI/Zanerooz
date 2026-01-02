import { getDictionary } from '@/i18n/getDictionary'
import { getLocaleFromCookies } from '@/utilities/getGlobals'
import { Award, Globe, Heart, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies()
  const dict = await getDictionary(locale)

  return {
    title: dict.about.title,
    description: dict.about.story.paragraph1,
  }
}

export default async function AboutPage() {
  const locale = await getLocaleFromCookies()
  const dict = await getDictionary(locale)

  const stats = [
    { label: dict.about.stats.yearsExperience, value: dict.about.stats.yearsValue, icon: Award },
    { label: dict.about.stats.happyCustomers, value: dict.about.stats.customersValue, icon: Users },
    { label: dict.about.stats.trustedBrands, value: dict.about.stats.brandsValue, icon: Globe },
    { label: dict.about.stats.authenticProducts, value: dict.about.stats.authenticValue, icon: Heart },
  ]

  return (
    <>
      {/* Page Header */}
      <section className="bg-card py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{dict.about.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {dict.about.breadcrumbHome}
            </Link>
            <span>/</span>
            <span>{dict.about.title}</span>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {dict.about.story.heading} <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">{dict.about.story.brandName}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {dict.about.story.paragraph1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {dict.about.story.paragraph2}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {dict.about.story.paragraph3}
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                alt={dict.about.story.imageAlt}
                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 rounded-lg shadow-lg">
                <div className="text-3xl font-bold">{dict.about.story.experienceYears}</div>
                <div className="text-sm">{dict.about.story.experienceLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-10 h-10 mx-auto text-accent mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            {dict.about.values.heading}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">{dict.about.values.authentic.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {dict.about.values.authentic.description}
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">{dict.about.values.satisfaction.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {dict.about.values.satisfaction.description}
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">{dict.about.values.global.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {dict.about.values.global.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
