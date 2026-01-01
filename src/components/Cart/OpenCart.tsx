import React from 'react'
import { ShoppingBag } from 'lucide-react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <button
      aria-label="Open cart"
      className={[
        'relative p-2 hover:bg-muted rounded-full transition-colors',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      {...rest}
    >
      <ShoppingBag className="w-5 h-5 text-foreground" />

      <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 bg-accent text-accent-foreground text-xs flex items-center justify-center rounded-full">
        {quantity ?? 0}
      </span>
    </button>
  )
}
