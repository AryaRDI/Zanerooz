import { RequiredDataFromCollectionSlug } from 'payload'

export const homeStaticData: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'سبک زندگی لوکس و مدرن',
                  version: 1,
                },
              ],
              direction: 'rtl',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'مشاهده محصولات',
                      version: 1,
                    },
                  ],
                  direction: 'rtl',
                  fields: {
                    linkType: 'custom',
                    newTab: false,
                    url: '/products',
                  },
                  format: '',
                  indent: 0,
                  version: 2,
                },
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: ' — بهترین برندهای جهانی پوشاک و اکسسوری با ضمانت اصالت کالا',
                  version: 1,
                },
              ],
              direction: 'rtl',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'rtl',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    layout: [],
    meta: {
      description: 'فروشگاه آنلاین پوشاک و اکسسوری با بهترین برندهای جهانی',
      title: 'مُداستایل',
    },
    title: 'Home',
  }
}
