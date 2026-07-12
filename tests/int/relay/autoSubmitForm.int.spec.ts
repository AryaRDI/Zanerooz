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
