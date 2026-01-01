import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: {
    en: 'Footer',
    fa: 'فوتر',
  },
  hooks: {
    afterChange: [
      () => {
        // Invalidate cached footer global so brand and links update immediately
        revalidateTag('global_footer')
      },
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brand',
      type: 'group',
      label: {
        en: 'Brand',
        fa: 'برند',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          required: true,
          defaultValue: 'مُد',
          label: {
            en: 'Name',
            fa: 'نام',
          },
        },
        {
          name: 'highlight',
          type: 'text',
          localized: true,
          required: true,
          defaultValue: 'استایل',
          label: {
            en: 'Highlight',
            fa: 'بخش برجسته',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          defaultValue: 'فروشگاه آنلاین پوشاک و اکسسوری با بهترین برندهای جهانی',
          label: {
            en: 'Description',
            fa: 'توضیحات',
          },
        },
      ],
    },
    {
      name: 'linkGroups',
      type: 'array',
      maxRows: 4,
      label: {
        en: 'Link groups',
        fa: 'گروه‌های لینک',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          label: {
            en: 'Group title',
            fa: 'عنوان گروه',
          },
        },
        {
          name: 'links',
          type: 'array',
          maxRows: 10,
          label: {
            en: 'Links',
            fa: 'لینک‌ها',
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      maxRows: 6,
      label: {
        en: 'Social links',
        fa: 'شبکه‌های اجتماعی',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: {
            en: 'Platform',
            fa: 'پلتفرم',
          },
          options: [
            { label: { en: 'Instagram', fa: 'اینستاگرام' }, value: 'instagram' },
            { label: { en: 'Twitter', fa: 'توییتر' }, value: 'twitter' },
            { label: { en: 'WhatsApp', fa: 'واتساپ' }, value: 'whatsapp' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: {
            en: 'URL',
            fa: 'آدرس (URL)',
          },
          admin: {
            description: {
              en: 'Full URL including https://',
              fa: 'آدرس کامل همراه با https://',
            },
          },
        },
      ],
    },
    {
      name: 'badges',
      type: 'array',
      maxRows: 6,
      label: {
        en: 'Badges',
        fa: 'نشان‌ها',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
          label: {
            en: 'Label',
            fa: 'عنوان',
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      label: {
        en: 'Legacy links (fallback)',
        fa: 'لینک‌های قدیمی (پشتیبان)',
      },
      admin: {
        description: {
          en: 'Only used if “Link groups” is empty.',
          fa: 'فقط زمانی استفاده می‌شود که “گروه‌های لینک” خالی باشد.',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
