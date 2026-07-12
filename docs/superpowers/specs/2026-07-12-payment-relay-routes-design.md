# Payment Relay Routes (`/tobank`, `/callback`) — Design

## Context

Two legacy PHP scripts (`tobank.php`, `callback.php`) implement a client-side
"form relay" pattern required by direct-bank IPG integrations: a browser is
POSTed a set of hidden fields plus a target URL, and an auto-submitting HTML
form forwards those fields on to the real destination. This pattern exists
because an HTTP redirect can't carry a POST body — the browser has to submit
a real form.

These two scripts are infrastructure for a **new payment gateway aggregator
("mahanbash")** that Zanerooz is integrating with. They are invisible to the
storefront — no new payment method appears in the checkout UI. mahanbash's
own backend generates the auto-submit forms/redirects that call these routes;
Zanerooz just needs to host equivalent endpoints on its own domain because
the bank IPG's callback URL must be registered on the merchant's own domain.

The task is to port both scripts, functionally unchanged, into this Next.js
app as `/tobank` and `/callback`.

## Behavior mapping (PHP → this app)

| PHP script | New route | Method(s) |
|---|---|---|
| `tobank.php` | `src/app/tobank/route.ts` | `POST` |
| `callback.php` | `src/app/callback/route.ts` | `GET`, `POST` |

Both routes are plain Next.js Route Handlers, not pages — they return raw
`text/html` responses with no React rendering, no layout, no site chrome,
matching the PHP scripts' raw HTML output today.

## Two intentional deviations from the PHP (agreed with product owner)

1. **HTML escaping.** The PHP scripts interpolate posted field values
   directly into HTML attributes with no escaping — a value like
   `"><script>...` breaks out of the `value="..."` attribute and executes.
   The port HTML-escapes every field name, field value, and target URL
   before interpolating them into the generated HTML. This does not change
   what data is ultimately submitted to the bank/mahanbash — the browser
   still POSTs the original (unescaped) values in the auto-submitted form;
   escaping only affects how those values are rendered in the intermediate
   relay page.
2. **Basic server-side logging.** The PHP scripts are silent. The port logs
   one line per request (method, a relevant identifier — target host for
   `/tobank`, `invoice_key` for `/callback` — and outcome) via
   `console.log`/`console.error`, so failures are greppable in server logs.
   No new database tables, no admin UI.

Everything else — including `/tobank` accepting any `BANK_URL` with no
allowlist, and `https://mahanbash.ir/` being a hardcoded literal rather than
an environment variable — mirrors the PHP exactly, per explicit direction.

## Architecture

```
src/app/tobank/route.ts        — POST handler
src/app/callback/route.ts      — GET + POST handler
src/lib/relay/autoSubmitForm.ts — shared HTML-rendering helper
```

### `src/lib/relay/autoSubmitForm.ts`

Exports a function that takes a target URL, an HTTP method (`'get' | 'post'`),
and a record of string fields, and returns the full HTML document string:

- HTML-escapes the target URL and every field name/value before
  interpolating.
- Emits the same structure as the PHP output: title `در حال انتقال`, a
  `<form>` with the given `action`/`method`, one hidden `<input>` per field,
  a hidden submit button, and an inline `<script>` calling
  `document.forms[0].submit()`.

Both routes use this helper so escaping and markup stay consistent in one
place.

### `src/app/tobank/route.ts` — `POST`

1. Parse the request body via `request.formData()` (handles both
   `application/x-www-form-urlencoded` and `multipart/form-data`, matching
   PHP's automatic `$_POST` population).
2. Require a `BANK_URL` field. If absent: log a warning, return an empty
   body with status `200` (matches PHP's `die('')`).
3. Read optional `BANK_URL_METHOD`. If it is exactly `"GET"`, render the
   relay form with `method="get"`; otherwise (including when absent),
   `method="post"`. (The PHP's alternate "redirect instead of form" branch
   for the GET case is commented out/dead in the source — this port never
   issues an HTTP redirect from `/tobank`, only ever the auto-submit form,
   matching the PHP's actual runtime behavior.)
4. Every remaining posted field (all fields except `BANK_URL` and
   `BANK_URL_METHOD`) becomes a hidden input in the generated form; `action`
   is the (escaped) `BANK_URL`.
5. Return the HTML with `Content-Type: text/html; charset=utf-8`, status
   `200`.
6. No allowlist on `BANK_URL` — the relay stays open, matching the PHP.

A request with a method other than `POST` receives Next.js's default `405`.
(The PHP would technically return an empty `200` for a non-POST hit, since
`$_POST` is simply empty in that case — but nothing in the intended flow
ever calls `/tobank` with anything but `POST`, so this is a difference only
an out-of-flow request would observe, not a functional gap.)

### `src/app/callback/route.ts` — `GET`, `POST`

Both methods share one core handler.

1. Read `invoice_key` from the URL's query string
   (`request.nextUrl.searchParams`) — available identically for `GET` and
   `POST`, matching PHP's `$_GET`. If missing: log a warning, return an
   empty body with status `200` (matches `die('')`).
2. Build the destination URL:
   `https://mahanbash.ir/invoice/processTransaction/{invoice_key}/`, then
   append any *other* query-string params (everything except `invoice_key`)
   as a `?...` suffix — mirroring PHP's `http_build_query($_GET)` after
   unsetting `invoice_key`. This base URL is a hardcoded literal, not an
   environment variable.
3. For `POST` requests, additionally parse the body via `request.formData()`.
4. If there is no POST body content (always true for `GET`; also true for a
   `POST` with an empty body) → issue an HTTP `302` redirect to the
   destination. No HTML page in this branch, matching PHP's
   `header('Location: ...')` branch.
5. If there is POST body content → render the same escaped auto-submit-form
   HTML as `/tobank`, always with `method="post"`, `action` = the (escaped)
   destination URL, and the POST fields as hidden inputs.

## Error handling

- A malformed request body (e.g. an unparseable `Content-Type` causing
  `formData()` to throw) is caught, logged as an error, and answered with an
  empty `200` — never a raw 500 or stack trace, matching the PHP's "die
  quietly" posture.
- All HTML escaping goes through the one shared helper so both routes get
  identical treatment; there is no path that interpolates raw user input
  into HTML.

## Testing

- Unit tests (Vitest, matching the project's existing `pnpm test:int`
  convention) for `autoSubmitForm`: escaping behavior (a value containing
  `"><script>` renders as inert text, not live markup), correct
  method/action rendering.
- Unit/integration tests per route:
  - `/tobank`: happy path (valid fields → correct HTML output), missing
    `BANK_URL` → empty 200, `BANK_URL_METHOD=GET` vs. default POST.
  - `/callback`: missing `invoice_key` → empty 200, GET → redirect branch,
    POST with body → form-render branch, extra query params correctly
    appended to the mahanbash destination.
- No Playwright/E2E coverage is planned — there is no bank/mahanbash sandbox
  reachable from CI. The unit/integration coverage above is what's
  verifiable in isolation.

## Out of scope

- No new checkout UI or payment method selection — these routes are pure
  relay infrastructure, not user-facing.
- No database persistence of relayed requests — logging is to server
  console/logs only.
- No environment-variable configuration for the mahanbash base URL or a
  `BANK_URL` allowlist — both are explicitly out of scope per product
  direction.
