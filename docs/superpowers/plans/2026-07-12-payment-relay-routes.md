# Payment Relay Routes (`/tobank`, `/callback`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the legacy `tobank.php`/`callback.php` form-relay pattern into two native Next.js Route Handlers, `/tobank` and `/callback`, that support a new "mahanbash" payment gateway integration.

**Architecture:** Two Route Handlers (`src/app/tobank/route.ts`, `src/app/callback/route.ts`) return raw `text/html` responses built by a shared helper (`src/lib/relay/autoSubmitForm.ts`) that HTML-escapes every interpolated value. No React rendering, no layout, no database, no UI — this is invisible relay infrastructure.

**Tech Stack:** Next.js 15 App Router Route Handlers, TypeScript, Vitest (`pnpm test:int`).

## Global Constraints

- Routes must resolve to exactly `/tobank` and `/callback` (root-level paths, not under `/api` or any route group prefix).
- Every value interpolated into generated HTML (field names, field values, target/action URLs) must be HTML-escaped via one shared function — no raw interpolation anywhere.
- `/tobank` has no allowlist on `BANK_URL` — it relays to whatever URL is posted to it, matching the original PHP.
- The mahanbash base URL, `https://mahanbash.ir/`, is a hardcoded literal — not an environment variable.
- Both routes log one line per request via `console.log`/`console.error` (method + a relevant identifier + outcome). No database writes, no admin UI.
- Relay HTML responses use `Content-Type: text/html; charset=utf-8`, status `200`.
- A request missing a required field (`BANK_URL` for `/tobank`, `invoice_key` for `/callback`) returns an empty body with status `200` — never a 4xx/5xx.
- `/callback`'s redirect branch uses HTTP status `302`.
- New tests live under `tests/int/**/*.int.spec.ts` (the project's existing Vitest `include` pattern) and run via `pnpm test:int`. Since these tests exercise Next.js Route Handlers that need real Node `Request`/`FormData` APIs, each new test file starts with a `// @vitest-environment node` directive to override the project's default `jsdom` environment.
- Path alias `@/*` maps to `./src/*` (existing `tsconfig.json` config) — use `@/lib/relay/autoSubmitForm`, `@/app/tobank/route`, `@/app/callback/route` in imports.

---

### Task 1: Shared auto-submit-form HTML helper

**Files:**
- Create: `src/lib/relay/autoSubmitForm.ts`
- Test: `tests/int/relay/autoSubmitForm.int.spec.ts`

**Interfaces:**
- Produces (used by Tasks 2 and 3):
  - `export type AutoSubmitFormMethod = 'get' | 'post'`
  - `export function escapeHtml(value: string): string`
  - `export function renderAutoSubmitForm(options: { actionUrl: string; method: AutoSubmitFormMethod; fields: Record<string, string> }): string`

- [ ] **Step 1: Write the failing test file**

Create `tests/int/relay/autoSubmitForm.int.spec.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { escapeHtml, renderAutoSubmitForm } from '@/lib/relay/autoSubmitForm'

describe('escapeHtml', () => {
  it('escapes ampersands, quotes, and angle brackets', () => {
    const result = escapeHtml(`"><script>alert('x')</script>&`)
    expect(result).toBe('&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;')
  })

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('Amount50000')).toBe('Amount50000')
  })
})

describe('renderAutoSubmitForm', () => {
  it('renders a form with escaped hidden inputs, action, and method', () => {
    const html = renderAutoSubmitForm({
      actionUrl: 'https://bank.example.com/pay?ref=1&x=2',
      method: 'post',
      fields: { Amount: '50000', Description: 'Order "42"' },
    })

    expect(html).toContain('<title>در حال انتقال</title>')
    expect(html).toContain('<form action="https://bank.example.com/pay?ref=1&amp;x=2" method="post">')
    expect(html).toContain('<input type="hidden" name="Amount" value="50000"/>')
    expect(html).toContain('<input type="hidden" name="Description" value="Order &quot;42&quot;"/>')
    expect(html).toContain('document.forms[0].submit();')
  })

  it('renders method="get" when requested', () => {
    const html = renderAutoSubmitForm({
      actionUrl: 'https://bank.example.com/pay',
      method: 'get',
      fields: {},
    })

    expect(html).toContain('<form action="https://bank.example.com/pay" method="get">')
  })

  it('neutralizes an attempted attribute breakout in a field value', () => {
    const html = renderAutoSubmitForm({
      actionUrl: 'https://bank.example.com/pay',
      method: 'post',
      fields: { evil: `"><script>alert(1)</script>` },
    })

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('value="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/relay/autoSubmitForm.int.spec.ts`
Expected: FAIL — `Cannot find module '@/lib/relay/autoSubmitForm'` (module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/relay/autoSubmitForm.ts`:

```ts
export type AutoSubmitFormMethod = 'get' | 'post'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderAutoSubmitForm(options: {
  actionUrl: string
  method: AutoSubmitFormMethod
  fields: Record<string, string>
}): string {
  const { actionUrl, method, fields } = options

  const hiddenInputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}"/>`,
    )
    .join('\n')

  return `<html>
<head>
<title>در حال انتقال</title>
</head>
<body>
<form action="${escapeHtml(actionUrl)}" method="${method}">
${hiddenInputs}
<input type="submit" style="display: none;">
</form>
<script type="text/javascript">
document.forms[0].submit();
</script>
</body>
</html>`
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- tests/int/relay/autoSubmitForm.int.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/relay/autoSubmitForm.ts tests/int/relay/autoSubmitForm.int.spec.ts
git commit -m "feat: add shared auto-submit-form HTML relay helper"
```

---

### Task 2: `/tobank` route handler

**Files:**
- Create: `src/app/tobank/route.ts`
- Test: `tests/int/relay/tobank.int.spec.ts`

**Interfaces:**
- Consumes: `renderAutoSubmitForm`, `AutoSubmitFormMethod` from `@/lib/relay/autoSubmitForm` (Task 1).
- Produces: `export async function POST(request: NextRequest): Promise<NextResponse>` from `src/app/tobank/route.ts`.

- [ ] **Step 1: Write the failing test file**

Create `tests/int/relay/tobank.int.spec.ts`:

```ts
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
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/relay/tobank.int.spec.ts`
Expected: FAIL — `Cannot find module '@/app/tobank/route'` (route doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/app/tobank/route.ts`:

```ts
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

  if (typeof bankUrl !== 'string' || bankUrl.length === 0) {
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- tests/int/relay/tobank.int.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/tobank/route.ts tests/int/relay/tobank.int.spec.ts
git commit -m "feat: add /tobank payment relay route"
```

---

### Task 3: `/callback` route handler

**Files:**
- Create: `src/app/callback/route.ts`
- Test: `tests/int/relay/callback.int.spec.ts`

**Interfaces:**
- Consumes: `renderAutoSubmitForm` from `@/lib/relay/autoSubmitForm` (Task 1).
- Produces: `export async function GET(request: NextRequest): Promise<NextResponse>` and `export async function POST(request: NextRequest): Promise<NextResponse>` from `src/app/callback/route.ts`.

- [ ] **Step 1: Write the failing test file**

Create `tests/int/relay/callback.int.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/relay/callback.int.spec.ts`
Expected: FAIL — `Cannot find module '@/app/callback/route'` (route doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/app/callback/route.ts`:

```ts
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
    formData = new FormData()
  }

  return handleCallback(request, formData)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int -- tests/int/relay/callback.int.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/callback/route.ts tests/int/relay/callback.int.spec.ts
git commit -m "feat: add /callback payment relay route"
```

---

### Task 4: Final verification

**Files:** none (verification only).

**Interfaces:** none — this task only runs existing tooling across the files created in Tasks 1–3.

- [ ] **Step 1: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/relay/autoSubmitForm.ts`, `src/app/tobank/route.ts`, or `src/app/callback/route.ts`.

- [ ] **Step 2: Lint the whole project**

Run: `pnpm lint`
Expected: no new errors/warnings in the three new source files (pre-existing warnings elsewhere in the repo, if any, are out of scope).

- [ ] **Step 3: Run the full integration test suite**

Run: `pnpm test:int`
Expected: PASS, including the existing `tests/int/api.int.spec.ts` and all three new `tests/int/relay/*.int.spec.ts` files (15 new tests total: 5 + 4 + 6).

- [ ] **Step 4: Manual smoke check with curl**

With the dev server running (`pnpm dev` in another terminal), run:

```bash
curl -s -D - -o /dev/null -X POST http://localhost:3000/tobank \
  --data-urlencode "BANK_URL=https://example.com/pay" \
  --data-urlencode "Amount=50000"
```

Expected: `HTTP/1.1 200 OK` with `content-type: text/html; charset=utf-8`.

```bash
curl -s -D - -o /dev/null "http://localhost:3000/callback?invoice_key=test123"
```

Expected: `HTTP/1.1 302 Found` with `location: https://mahanbash.ir/invoice/processTransaction/test123/`.

- [ ] **Step 5: Commit if any fixes were needed**

If Steps 1–4 required any code changes, stage and commit them:

```bash
git add -A
git commit -m "fix: address type/lint issues in payment relay routes"
```

If no changes were needed, skip this step — there is nothing to commit.
