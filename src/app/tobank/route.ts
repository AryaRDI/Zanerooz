import { NextRequest, NextResponse } from 'next/server'
import { renderAutoSubmitForm, type AutoSubmitFormMethod } from '@/lib/relay/autoSubmitForm'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch (error) {
    console.error('[tobank] failed to parse request body:', error)
    return new NextResponse('', { status: 200 })
  }

  const bankUrl = formData.get('BANK_URL')

  // PHP isset() parity: an empty string is "present" — only a genuinely
  // absent field (or a non-string File value) counts as missing.
  if (typeof bankUrl !== 'string') {
    console.warn('[tobank] request missing BANK_URL field')
    return new NextResponse('', { status: 200 })
  }

  const bankUrlMethod = formData.get('BANK_URL_METHOD')
  const method: AutoSubmitFormMethod = bankUrlMethod === 'GET' ? 'get' : 'post'

  const fields: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key === 'BANK_URL' || key === 'BANK_URL_METHOD') continue
    if (typeof value === 'string') {
      fields[key] = value
    }
  }

  console.log(`[tobank] relaying to ${bankUrl} via ${method.toUpperCase()}`)

  const html = renderAutoSubmitForm({ actionUrl: bankUrl, method, fields })

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
