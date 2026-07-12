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
