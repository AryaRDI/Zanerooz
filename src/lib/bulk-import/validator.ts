/**
 * Product row structure from CSV
 * Primary price is IRT (Toman), USD is optional
 */
export interface ProductRow {
  title_en: string
  title_fa: string
  price_irt: string
  status: string
  image_urls: string
  price_usd?: string
  description_en?: string
  description_fa?: string
  categories?: string
  meta_title?: string
  meta_description?: string
  inventory?: string
  slug?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate a product row from CSV
 * Returns validation result with array of error messages
 */
export function validateRow(row: any): ValidationResult {
  const errors: string[] = []

  // Required: title_en
  if (!row.title_en || typeof row.title_en !== 'string' || !row.title_en.trim()) {
    errors.push('title_en is required')
  }

  // Required: title_fa
  if (!row.title_fa || typeof row.title_fa !== 'string' || !row.title_fa.trim()) {
    errors.push('title_fa is required')
  }

  // Required: price_irt (must be positive number)
  if (!row.price_irt) {
    errors.push('price_irt is required')
  } else {
    const priceNum = parseFloat(row.price_irt)
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.push('price_irt must be a positive number')
    }
  }

  // Optional: price_usd (must be positive number if provided)
  if (row.price_usd) {
    const usdNum = parseFloat(row.price_usd)
    if (isNaN(usdNum) || usdNum <= 0) {
      errors.push('price_usd must be a positive number')
    }
  }

  // Required: status (must be 'published' or 'draft')
  if (!row.status) {
    errors.push('status is required')
  } else if (row.status !== 'published' && row.status !== 'draft') {
    errors.push('status must be either "published" or "draft"')
  }

  // Required: image_urls (must have at least 1 valid URL)
  if (!row.image_urls || typeof row.image_urls !== 'string' || !row.image_urls.trim()) {
    errors.push('image_urls is required')
  } else {
    const urls = row.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
    if (urls.length === 0) {
      errors.push('image_urls must contain at least one URL')
    } else {
      // Basic URL validation
      const validUrls = urls.filter((url: string) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })
      if (validUrls.length === 0) {
        errors.push('image_urls must contain at least one valid URL')
      }
    }
  }

  // Optional: inventory (must be non-negative integer if provided)
  if (row.inventory !== undefined && row.inventory !== '') {
    const inventoryNum = parseInt(row.inventory, 10)
    if (isNaN(inventoryNum) || inventoryNum < 0) {
      errors.push('inventory must be a non-negative integer')
    } else if (!Number.isInteger(parseFloat(row.inventory))) {
      errors.push('inventory must be a whole number')
    }
  }

  // Optional: slug (must be URL-friendly if provided)
  if (row.slug !== undefined && row.slug !== '') {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(row.slug)) {
      errors.push('slug must be lowercase letters, numbers, and hyphens only (e.g., "my-product-name")')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
