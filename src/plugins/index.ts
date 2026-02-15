import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Plugin } from 'payload'

import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    addresses: {
      supportedCountries: [
        { label: 'Iran', value: 'IR' },
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'GB' },
        { label: 'Canada', value: 'CA' },
        { label: 'Australia', value: 'AU' },
        { label: 'Austria', value: 'AT' },
        { label: 'Belgium', value: 'BE' },
        { label: 'Brazil', value: 'BR' },
        { label: 'Bulgaria', value: 'BG' },
        { label: 'Cyprus', value: 'CY' },
        { label: 'Czech Republic', value: 'CZ' },
        { label: 'Denmark', value: 'DK' },
        { label: 'Estonia', value: 'EE' },
        { label: 'Finland', value: 'FI' },
        { label: 'France', value: 'FR' },
        { label: 'Germany', value: 'DE' },
        { label: 'Greece', value: 'GR' },
        { label: 'Hong Kong', value: 'HK' },
        { label: 'Hungary', value: 'HU' },
        { label: 'India', value: 'IN' },
        { label: 'Ireland', value: 'IE' },
        { label: 'Italy', value: 'IT' },
        { label: 'Japan', value: 'JP' },
        { label: 'Latvia', value: 'LV' },
        { label: 'Lithuania', value: 'LT' },
        { label: 'Luxembourg', value: 'LU' },
        { label: 'Malaysia', value: 'MY' },
        { label: 'Malta', value: 'MT' },
        { label: 'Mexico', value: 'MX' },
        { label: 'Netherlands', value: 'NL' },
        { label: 'New Zealand', value: 'NZ' },
        { label: 'Norway', value: 'NO' },
        { label: 'Poland', value: 'PL' },
        { label: 'Portugal', value: 'PT' },
        { label: 'Romania', value: 'RO' },
        { label: 'Singapore', value: 'SG' },
        { label: 'Slovakia', value: 'SK' },
        { label: 'Slovenia', value: 'SI' },
        { label: 'Spain', value: 'ES' },
        { label: 'Sweden', value: 'SE' },
        { label: 'Switzerland', value: 'CH' },
        { label: 'Turkey', value: 'TR' },
        { label: 'United Arab Emirates', value: 'AE' },
      ],
    },
    customers: {
      slug: 'users',
    },
    currencies: {
      defaultCurrency: 'USD',
      supportedCurrencies: [
        {
          code: 'USD',
          decimals: 2,
          label: 'US Dollar',
          symbol: '$',
        },
        {
          code: 'IRT',
          decimals: 0,
          label: 'Iranian Toman',
          symbol: 'تومان',
        },
      ],
    },
    payments: {
      paymentMethods: [
        // Stripe payment gateway (International cards)
        // Note: Zarinpal is handled via custom API endpoints, not as a payment adapter
        ...(process.env.STRIPE_SECRET_KEY
          ? [
              stripeAdapter({
                secretKey: process.env.STRIPE_SECRET_KEY,
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
                webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
              }),
            ]
          : []),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
