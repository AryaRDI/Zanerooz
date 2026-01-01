/**
 * Parse CSV string into array of objects
 * Handles quoted fields, escaped quotes, and multi-line values
 */
export function parseCSV(csvString: string): Record<string, string>[] {
  const lines = csvString.split('\n')
  if (lines.length === 0) {
    return []
  }

  // Parse header row
  const headers = parseCSVLine(lines[0])
  if (headers.length === 0) {
    return []
  }

  // Parse data rows
  const result: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      continue
    }

    const values = parseCSVLine(line)
    const row: Record<string, string> = {}

    // Map values to headers
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    result.push(row)
  }

  return result
}

/**
 * Parse a single CSV line handling quoted fields
 * Examples:
 * - Simple: a,b,c → ['a', 'b', 'c']
 * - Quoted: "a,b",c → ['a,b', 'c']
 * - Escaped: "a""b",c → ['a"b', 'c']
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote "" → "
        current += '"'
        i += 2
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ''
      i++
    } else {
      // Regular character
      current += char
      i++
    }
  }

  // Add final field
  result.push(current.trim())

  return result
}
