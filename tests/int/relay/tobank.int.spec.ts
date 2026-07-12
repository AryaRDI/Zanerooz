// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/tobank/route'

function postRequest(fields: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost:3000/tobank', {
    method: 'POST',
    body: new URLSearchParams(fields),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

describe('POST /tobank', () => {
  it('renders an auto-submit form posting to BANK_URL with the remaining fields', async () => {
    const response = await POST(
      postRequest({
        BANK_URL: 'https://bank.example.com/pay',
        Amount: '50000',
        ResNum: 'ORDER-1',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')

    const html = await response.text()
    expect(html).toContain('<form action="https://bank.example.com/pay" method="post">')
    expect(html).toContain('<input type="hidden" name="Amount" value="50000"/>')
    expect(html).toContain('<input type="hidden" name="ResNum" value="ORDER-1"/>')
    expect(html).not.toContain('name="BANK_URL"')
  })

  it('uses method="get" when BANK_URL_METHOD is GET', async () => {
    const response = await POST(
      postRequest({
        BANK_URL: 'https://bank.example.com/pay',
        BANK_URL_METHOD: 'GET',
        Amount: '50000',
      }),
    )

    const html = await response.text()
    expect(html).toContain('<form action="https://bank.example.com/pay" method="get">')
    expect(html).not.toContain('name="BANK_URL_METHOD"')
  })

  it('defaults to method="post" when BANK_URL_METHOD is absent', async () => {
    const response = await POST(postRequest({ BANK_URL: 'https://bank.example.com/pay' }))
    const html = await response.text()
    expect(html).toContain('method="post">')
  })

  it('returns an empty 200 response when BANK_URL is missing', async () => {
    const response = await POST(postRequest({ Amount: '50000' }))

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })

  it('returns an empty 200 when request body is malformed multipart/form-data', async () => {
    // Construct a request with multipart/form-data Content-Type but a body that does not
    // match the declared boundary, causing formData() to throw during parsing.
    const malformedBody = 'This is not a valid multipart body with boundary markers'
    const req = new NextRequest('http://localhost:3000/tobank', {
      method: 'POST',
      body: malformedBody,
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary1234567890',
      },
    })

    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })

  it('treats empty string BANK_URL as present, matching PHP isset() semantics', async () => {
    const response = await POST(
      postRequest({
        BANK_URL: '',
        Amount: '50000',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')

    const html = await response.text()
    expect(html).toContain('<form action="" method="post">')
    expect(html).toContain('<input type="hidden" name="Amount" value="50000"/>')
  })
})
