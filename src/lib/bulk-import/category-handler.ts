import type { Payload, PayloadRequest } from 'payload'

/**
 * Find existing category by title or create new one
 * Returns category ID or null if failed
 */
export async function findOrCreateCategory(
  title: string,
  payload: Payload,
  req: PayloadRequest,
): Promise<number | null> {
  try {
    const slug = generateSlug(title)

    // Search for existing category by slug (avoids localized title lookups)
    const existingCategories = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      req,
    })

    // Return existing category if found
    if (existingCategories.docs.length > 0) {
      return existingCategories.docs[0].id as number
    }

    // Create new category
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        title, // store under default locale; fallback handles other locales
        slug,
      },
      locale: 'fa',
      req,
    })

    return newCategory.id as number
  } catch (error) {
    payload.logger.error({ err: error, message: `Error creating category: ${title}` })
    return null
  }
}

/**
 * Generate URL-friendly slug from text
 * Example: "T-Shirts & Accessories" → "t-shirts-accessories"
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}
