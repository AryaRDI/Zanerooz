import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
      views: {
        'bulk-import': {
          Component: '@/components/BulkImport#BulkImportPage',
          path: '/bulk-import',
        },
      },
    },
    user: Users.slug,
  },
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'فارسی',
        code: 'fa',
        rtl: true,
      },
    ],
    defaultLocale: 'fa',
    fallback: true,
  },
  collections: [Users, Pages, Categories, Media],
  db: vercelPostgresAdapter({
    pool: {
      connectionString: (() => {
        const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

        if (!connectionString) {
          throw new Error(
            [
              'Missing Postgres connection string.',
              'Set `POSTGRES_URL` (or `DATABASE_URL`) to a Postgres connection string.',
              'If you are using Supabase locally, this must be the DB port (typically 54322), not the Supabase API port (54321).',
            ].join(' '),
          )
        }

        if (/^https?:\/\//i.test(connectionString)) {
          throw new Error(
            [
              '`POSTGRES_URL` looks like an HTTP URL, but it must be a Postgres connection string.',
              'If you are using Supabase locally, do NOT use `http://127.0.0.1:54321` (Supabase API).',
              'Use the Postgres URL on port 54322, e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.',
            ].join(' '),
          )
        }

        try {
          const url = new URL(connectionString)
          if (url.port === '54321' && /^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) {
            throw new Error(
              [
                '`POSTGRES_URL` is pointing at port 54321, which is the Supabase API port, not Postgres.',
                'Use the Supabase local DB port (typically 54322), e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.',
              ].join(' '),
            )
          }
        } catch {
          // Ignore URL parse errors here—driver will surface a better error if malformed.
        }

        return connectionString
      })(),
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [],
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true, // required for Supabase S3-compatible endpoints
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
