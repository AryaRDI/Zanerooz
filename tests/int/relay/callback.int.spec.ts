// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/callback/route'

describe('GET /callback', () => {
  it('redirects to the mahanbash processTransaction URL for the invoice key', async () => {
    const request = new NextRequest('http://localhost:3000/callback?invoice_key=abc123')

    const response = await GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://mahanbash.ir/invoice/processTransaction/abc123/',
    )
  })

  it('appends other query params to the redirect target', async () => {
    const request = new NextRequest(
      'http://localhost:3000/callback?invoice_key=abc123&status=OK&trackId=99',
    )

    const response = await GET(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://mahanbash.ir/invoice/processTransaction/abc123/?status=OK&trackId=99',
    )
  })

  it('returns an empty 200 response when invoice_key is missing', async () => {
    const request = new NextRequest('http://localhost:3000/callback?status=OK')

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })
})

describe('POST /callback', () => {
  it('redirects when the POST body has no fields', async () => {
    const request = new NextRequest('http://localhost:3000/callback?invoice_key=abc123', {
      method: 'POST',
      body: new URLSearchParams(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const response = await POST(request)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://mahanbash.ir/invoice/processTransaction/abc123/',
    )
  })

  it('renders an auto-submit form posting the fields when the POST body is non-empty', async () => {
    const request = new NextRequest('http://localhost:3000/callback?invoice_key=abc123', {
      method: 'POST',
      body: new URLSearchParams({ Status: 'OK', RefNum: '999' }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')

    const html = await response.text()
    expect(html).toContain(
      '<form action="https://mahanbash.ir/invoice/processTransaction/abc123/" method="post">',
    )
    expect(html).toContain('<input type="hidden" name="Status" value="OK"/>')
    expect(html).toContain('<input type="hidden" name="RefNum" value="999"/>')
  })

  it('returns an empty 200 response when invoice_key is missing', async () => {
    const request = new NextRequest('http://localhost:3000/callback', {
      method: 'POST',
      body: new URLSearchParams({ Status: 'OK' }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })
})
