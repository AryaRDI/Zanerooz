import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  label: {
    en: 'Header',
    fa: 'هدر',
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
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      label: {
        en: 'Navigation items',
        fa: 'آیتم‌های منو',
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
