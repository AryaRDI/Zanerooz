import type { Payload, PayloadRequest } from 'payload'

/**
 * Download image from URL and upload to Media collection
 * Returns the media ID or null if failed
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  payload: Payload,
  req: PayloadRequest,
): Promise<number | null> {
  try {
    // Fetch image with User-Agent header
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BulkImport/1.0)',
      },
    })

    if (!response.ok) {
      payload.logger.warn(`Failed to download image: ${imageUrl} (${response.status})`)
      return null
    }

    // Convert to Buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract filename from URL
    const urlObj = new URL(imageUrl)
    const pathParts = urlObj.pathname.split('/')
    const filename = pathParts[pathParts.length - 1] || 'image.jpg'

    // Determine MIME type from URL extension
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg'
    const mimeType =
      extension === 'png'
        ? 'image/png'
        : extension === 'jpg' || extension === 'jpeg'
          ? 'image/jpeg'
          : extension === 'webp'
            ? 'image/webp'
            : extension === 'gif'
              ? 'image/gif'
              : 'image/jpeg'

    // Generate alt text from filename
    const altText =
      filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) // Title case
        .trim() || 'Image'

    // Upload to Media collection
    const media = await payload.create({
      collection: 'media',
      data: {
        // Localization fallback is enabled; storing once satisfies required alt
        alt: altText,
      },
      file: {
        data: buffer,
        name: filename,
        size: buffer.length,
        mimetype: mimeType,
      },
      req,
    })

    return media.id as number
  } catch (error) {
    payload.logger.error({ err: error, message: `Error uploading image: ${imageUrl}` })
    return null
  }
}
