/**
 * Fetch Google Sheets data as CSV
 * Converts public Google Sheets URL (including "Publish to web" links) to CSV export format and fetches data
 */
export async function fetchGoogleSheetAsCSV(url: string): Promise<string> {
  // Normalize URL and extract sheet ID and gid
  let sheetId: string | undefined
  let gid = '0' // Default to first sheet

  try {
    const parsed = new URL(url)
    // Path shapes we need to handle:
    // - /spreadsheets/d/{id}/edit
    // - /spreadsheets/d/{id}/export?format=csv
    // - /spreadsheets/d/e/{publishedId}/pub?output=csv (Publish to web)
    const segments = parsed.pathname.split('/').filter(Boolean)
    const dIndex = segments.indexOf('d')

    if (dIndex !== -1 && segments[dIndex + 1]) {
      // Handle "/d/e/{id}" (publish-to-web) and "/d/{id}"
      const candidate = segments[dIndex + 1] === 'e' ? segments[dIndex + 2] : segments[dIndex + 1]
      if (candidate) {
        sheetId = candidate
      }
    }

    // Extract gid from query or hash (#gid=123 or ?gid=123)
    gid = parsed.searchParams.get('gid') || gid
    const hashGidMatch = parsed.hash.match(/gid=([0-9]+)/)
    if (hashGidMatch?.[1]) {
      gid = hashGidMatch[1]
    }
  } catch {
    // Fall through to validation error below
  }

  if (!sheetId) {
    throw new Error(
      'Invalid Google Sheets URL. Expected a docs.google.com/spreadsheets link with an ID after /d/.',
    )
  }

  // Construct CSV export URLs (primary + fallback for publish-to-web links)
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
  const fallbackCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`

  try {
    const fetchCsv = async (targetUrl: string) => {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BulkImport/1.0)',
          Accept: 'text/csv,text/plain,*/*',
        },
        redirect: 'follow',
      })

      if (!response.ok) {
        return {
          ok: false as const,
          status: response.status,
          statusText: response.statusText,
          body: await response.text(),
        }
      }

      return { ok: true as const, body: await response.text() }
    }

    // Try primary export URL, then fallback (gviz) which works better for published links
    const primary = await fetchCsv(csvUrl)
    const result = primary.ok ? primary : await fetchCsv(fallbackCsvUrl)

    if (!result.ok) {
      if (result.status === 404 || result.status === 403) {
        throw new Error(
          'Could not access Google Sheet. Make sure the sheet is publicly accessible (Share → Anyone with link can view).',
        )
      }
      if (result.status === 400) {
        throw new Error(
          'Google Sheets returned 400. Please verify the link and sharing settings:\n' +
            '1) Use the exact link from File → Share → Copy link (not a shortened link)\n' +
            '2) If you used "Publish to the web", copy the CSV link and try again\n' +
            '3) Ensure the sheet is set to "Anyone with link can view"\n' +
            `Details: ${result.statusText || 'Bad Request'}`,
        )
      }
      throw new Error(`Failed to fetch sheet data: ${result.status} ${result.statusText}`)
    }

    const csvData = result.body

    // Validate response is non-empty
    if (!csvData || csvData.trim().length === 0) {
      throw new Error('Sheet appears to be empty or could not be read.')
    }

    // Check if we got an error page instead of CSV
    if (csvData.includes('<!DOCTYPE html>') || csvData.includes('<html')) {
      throw new Error(
        'Received HTML instead of CSV. Make sure the sheet is publicly accessible (Share → Anyone with link can view).',
      )
    }

    return csvData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch Google Sheet data. Check the URL and permissions.')
  }
}
