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

  return {
    valid: errors.length === 0,
    errors,
  }
}
