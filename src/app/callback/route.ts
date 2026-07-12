import { NextRequest, NextResponse } from 'next/server'
import { renderAutoSubmitForm } from '@/lib/relay/autoSubmitForm'

const MAHANBASH_BASE_URL = 'https://mahanbash.ir/'

function buildDestinationUrl(searchParams: URLSearchParams, invoiceKey: string): string {
  const remaining = new URLSearchParams(searchParams)
  remaining.delete('invoice_key')

  const remainingQuery = remaining.toString()
  const base = `${MAHANBASH_BASE_URL}invoice/processTransaction/${invoiceKey}/`

  return remainingQuery ? `${base}?${remainingQuery}` : base
}

async function handleCallback(
  request: NextRequest,
  formData: FormData | null,
): Promise<NextResponse> {
  const invoiceKey = request.nextUrl.searchParams.get('invoice_key')

  if (!invoiceKey) {
    console.warn('[callback] request missing invoice_key query param')
    return new NextResponse('', { status: 200 })
  }

  const destinationUrl = buildDestinationUrl(request.nextUrl.searchParams, invoiceKey)

  const hasPostFields = formData !== null && Array.from(formData.keys()).length > 0

  if (!hasPostFields) {
    console.log(`[callback] redirecting invoice ${invoiceKey} to ${destinationUrl}`)
    return NextResponse.redirect(destinationUrl, 302)
  }

  const fields: Record<string, string> = {}
  for (const [key, value] of formData!.entries()) {
    if (typeof value === 'string') {
      fields[key] = value
    }
  }

  console.log(`[callback] relaying invoice ${invoiceKey} via POST form to ${destinationUrl}`)

  const html = renderAutoSubmitForm({ actionUrl: destinationUrl, method: 'post', fields })

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleCallback(request, null)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch (error) {
    console.error('[callback] failed to parse request body:', error)
    return new NextResponse('', { status: 200 })
  }

  return handleCallback(request, formData)
}
