import type { Payload, PayloadRequest } from 'payload';

/**
 * Create new product or update existing one by slug
 * Returns product ID and whether it was newly created
 */
export async function createOrUpdateProduct(
  productData: any,
  payload: Payload,
  req: PayloadRequest,
): Promise<{ id: number; isNew: boolean }> {
  // Generate slug from English title
  const slug = generateSlug(productData.title.en)

  // Helper to map localized fields to a single-locale payload
  const buildLocaleData = (locale: 'en' | 'fa') => ({
    ...productData,
    title: productData.title[locale] || productData.title.en || productData.title.fa,
    description:
      productData.description?.[locale] ||
      productData.description?.en ||
      productData.description?.fa ||
      '',
    slug,
  })

  // Search for existing product with same slug
  const existingProducts = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    req,
  })

  if (existingProducts.docs.length > 0) {
    // Update existing product
    const existingId = existingProducts.docs[0].id as number
    // Update default locale (fa), then English locale
    await payload.update({
      collection: 'products',
      id: existingId,
      data: buildLocaleData('fa'),
      locale: 'fa',
      req,
    })

    await payload.update({
      collection: 'products',
      id: existingId,
      data: buildLocaleData('en'),
      locale: 'en',
      req,
    })

    return { id: existingId, isNew: false }
  } else {
    // Create new product
    const newProduct = await payload.create({
      collection: 'products',
      data: buildLocaleData('fa'),
      locale: 'fa',
      req,
    })

    await payload.update({
      collection: 'products',
      id: newProduct.id as number,
      data: buildLocaleData('en'),
      locale: 'en',
      req,
    })

    return { id: newProduct.id as number, isNew: true }
  }
}

/**
 * Generate URL-friendly slug from text
 * Example: "Classic Baseball Cap" → "classic-baseball-cap"
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}
