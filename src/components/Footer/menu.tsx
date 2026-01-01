import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'

interface Props {
  groups?: Footer['linkGroups']
  menu?: Footer['navItems']
  fallbackGroupTitle: string
}

export function FooterMenu({ groups, menu, fallbackGroupTitle }: Props) {
  const normalizedGroups =
    groups?.length
      ? groups
      : menu?.length
        ? [
            {
              title: fallbackGroupTitle,
              links: menu.map((item) => ({ link: item.link })),
            },
          ]
        : []

  if (!normalizedGroups.length) return null

  return (
    <nav className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {normalizedGroups.map((group, i) => {
        const links = group?.links || []
        if (!links.length) return null

        return (
          <div key={i}>
            <h4 className="font-bold mb-4">{group.title}</h4>
            <ul className="space-y-3">
              {links.map((item, index) => (
                <li key={(item as any)?.id || index}>
                  <CMSLink
                    appearance="inline"
                    {...(item as any).link}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
