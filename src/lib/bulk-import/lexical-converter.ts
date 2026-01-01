/**
 * Convert plain text to Lexical editor JSON format
 * Matches the structure used in Payload CMS products
 */
export function textToLexical(text: string) {
  if (!text || typeof text !== 'string') {
    return createEmptyLexical()
  }

  // Split by double newlines to create paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  // If no content, return empty structure
  if (paragraphs.length === 0) {
    return createEmptyLexical()
  }

  // Create paragraph nodes
  const children = paragraphs.map((paragraphText) => {
    // Replace single newlines with spaces within a paragraph
    const cleanText = paragraphText.replace(/\n/g, ' ').trim()

    return {
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: cleanText,
          type: 'text',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
      textFormat: 0,
      textStyle: '',
    }
  })

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Create empty Lexical structure with one empty paragraph
 */
function createEmptyLexical() {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
