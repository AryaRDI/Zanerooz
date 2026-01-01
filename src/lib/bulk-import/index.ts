import type { Payload, PayloadRequest } from 'payload'
import { findOrCreateCategory } from './category-handler'
import { parseCSV } from './csv-parser'
import { fetchGoogleSheetAsCSV } from './fetch-sheet'
import { downloadAndUploadImage } from './image-handler'
import { textToLexical } from './lexical-converter'
import { createOrUpdateProduct } from './product-handler'
import { validateRow, type ProductRow } from './validator'

interface ImportResult {
  success: boolean
  row: number
  productId?: number
  isNew?: boolean
  title?: string
  error?: string
  errors?: string[]
}

interface ImportSummary {
  results: ImportResult[]
  summary: {
    total: number
    succeeded: number
    failed: number
  }
}

/**
 * Main orchestrator for bulk product import
 * Processes Google Sheets URL and imports products
 */
export async function processProductImport(
  sheetUrl: string,
  payload: Payload,
  req: PayloadRequest,
): Promise<ImportSummary> {
  const results: ImportResult[] = []

  try {
    // 1. Fetch CSV from Google Sheets
    payload.logger.info('Fetching Google Sheet...')
    const csvData = await fetchGoogleSheetAsCSV(sheetUrl)

    // 2. Parse into row objects
    payload.logger.info('Parsing CSV data...')
    const rows = parseCSV(csvData) as unknown as ProductRow[]

    payload.logger.info(`Processing ${rows.length} products...`)

    // 3. Process each row
    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2 // +2 because index starts at 0 and row 1 is headers

      try {
        // Validate row data
        const validation = validateRow(row)
        if (!validation.valid) {
          results.push({
            success: false,
            row: rowNumber,
            errors: validation.errors,
            title: row.title_en || 'Unknown',
          })
          continue
        }

        // Download & upload images
        payload.logger.info(`Row ${rowNumber}: Downloading images for "${row.title_en}"...`)
        const imageIds: number[] = []
        const imageUrls = row.image_urls.split(',').map((url) => url.trim())

        for (const imageUrl of imageUrls) {
          const mediaId = await downloadAndUploadImage(imageUrl, payload, req)
          if (mediaId) {
            imageIds.push(mediaId)
          }
        }

        if (imageIds.length === 0) {
          results.push({
            success: false,
            row: rowNumber,
            error: 'Failed to download any images',
            title: row.title_en,
          })
          continue
        }

        // Find/create categories
        const categoryIds: number[] = []
        if (row.categories) {
          const categoryNames = row.categories.split(',').map((cat) => cat.trim())
          for (const categoryName of categoryNames) {
            const categoryId = await findOrCreateCategory(categoryName, payload, req)
            if (categoryId) {
              categoryIds.push(categoryId)
            }
          }
        }

        // Build product data
        // IRT is the primary price, USD is optional
        const priceInIRT = Math.round(parseFloat(row.price_irt))
        const priceInUSD =
          row.price_usd && !Number.isNaN(parseFloat(row.price_usd))
            ? Math.round(parseFloat(row.price_usd) * 100) // Convert to cents
            : undefined

        const productData = {
          title: {
            en: row.title_en,
            fa: row.title_fa,
          },
          description: {
            en: textToLexical(row.description_en || ''),
            fa: textToLexical(row.description_fa || ''),
          },
          priceInIRT,
          priceInIRTEnabled: true,
          ...(priceInUSD !== undefined
            ? {
                priceInUSD,
                priceInUSDEnabled: true,
              }
            : {
                priceInUSDEnabled: false,
              }),
          _status: row.status,
          gallery: imageIds.map((id) => ({ image: id })),
          categories: categoryIds,
          layout: [],
          meta: {
            title: row.meta_title || row.title_en,
            description: row.meta_description || row.description_en || '',
            image: imageIds[0] || null,
          },
        }

        // Create or update product
        payload.logger.info(
          `Row ${rowNumber}: ${productData._status === 'published' ? 'Publishing' : 'Creating draft'} product "${row.title_en}"...`,
        )
        const result = await createOrUpdateProduct(productData, payload, req)

        results.push({
          success: true,
          row: rowNumber,
          productId: result.id,
          isNew: result.isNew,
          title: row.title_en,
        })

        payload.logger.info(
          `Row ${rowNumber}: ✓ ${result.isNew ? 'Created' : 'Updated'} product "${row.title_en}"`,
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          success: false,
          row: rowNumber,
          error: errorMessage,
          title: row.title_en || 'Unknown',
        })
        payload.logger.error(`Row ${rowNumber}: Error processing product - ${errorMessage}`)
      }
    }

    // Return summary
    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    payload.logger.info(`Import complete: ${succeeded} succeeded, ${failed} failed`)

    return {
      results,
      summary: {
        total: results.length,
        succeeded,
        failed,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(`Bulk import failed: ${errorMessage}`)
    throw error
  }
}
