import { createLocalReq, getPayload } from 'payload'
import { processProductImport } from '@/lib/bulk-import'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 300 // 5 minutes for bulk operations

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check admin role
  if (!user.roles?.includes('admin')) {
    return new Response('Admin access required', { status: 403 })
  }

  try {
    const { sheetUrl } = await request.json()

    if (!sheetUrl || typeof sheetUrl !== 'string') {
      return Response.json({ error: 'Missing or invalid sheetUrl parameter' }, { status: 400 })
    }

    // Create a Payload request object to pass to the Local API for transactions
    const payloadReq = await createLocalReq({ user }, payload)

    // Process import
    payload.logger.info(`Starting bulk import from: ${sheetUrl}`)
    const result = await processProductImport(sheetUrl, payload, payloadReq)

    return Response.json({
      success: true,
      ...result,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error({ err: error, message: 'Bulk import failed' })

    return Response.json(
      {
        error: 'Import failed',
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
