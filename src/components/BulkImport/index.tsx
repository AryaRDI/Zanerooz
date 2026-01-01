'use client'

import { Banner } from '@payloadcms/ui'
import React, { useState } from 'react'

interface ImportResult {
  success: boolean
  row: number
  productId?: number
  isNew?: boolean
  title?: string
  error?: string
  errors?: string[]
}

interface ImportResponse {
  success?: boolean
  error?: string
  details?: string
  results?: ImportResult[]
  summary?: {
    total: number
    succeeded: number
    failed: number
  }
}

export const BulkImportPage: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResponse | null>(null)

  const handleImport = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/import-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sheetUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResults({
          error: data.error || 'Import failed',
          details: data.details,
        })
      } else {
        setResults(data)
      }
    } catch (error) {
      setResults({
        error: 'Failed to connect to server',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      <Banner type="info">
        <h4>Bulk Product Import from Google Sheets</h4>
      </Banner>

      <div style={{ marginTop: '2rem' }}>
        <h3>Import Instructions</h3>
        <ol>
          <li>
            Make your Google Sheet <strong>publicly accessible</strong> (Share → Anyone with link
            can view)
          </li>
          <li>Paste the sheet URL below</li>
          <li>Click Import to process products</li>
        </ol>

        <div style={{ marginTop: '1.5rem' }}>
          <label
            htmlFor="sheet-url"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Google Sheets URL:
          </label>
          <input
            id="sheet-url"
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !sheetUrl}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: loading || !sheetUrl ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !sheetUrl ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Importing...' : 'Import Products'}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Import Results</h3>
          {results.error ? (
            <div>
              <Banner type="error">
                <strong>{results.error}</strong>
                {results.details && (
                  <div style={{ marginTop: '0.5rem', fontSize: '14px' }}>{results.details}</div>
                )}
              </Banner>
            </div>
          ) : (
            <>
              <Banner type="success">
                <strong>
                  Imported {results.summary?.succeeded} of {results.summary?.total} products
                </strong>
                {results.summary?.failed && results.summary.failed > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {results.summary.failed} product(s) failed to import
                  </div>
                )}
              </Banner>

              <div style={{ marginTop: '1.5rem' }}>
                <h4>Details:</h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {results.results?.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        backgroundColor: r.success ? '#d4edda' : '#f8d7da',
                        color: r.success ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '14px',
                        border: r.success ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                      }}
                    >
                      <strong>Row {r.row}:</strong>{' '}
                      {r.success ? (
                        <>
                          {r.isNew ? '✓ Created' : '✓ Updated'} &quot;{r.title}&quot;
                        </>
                      ) : (
                        <>
                          ✗ Error: {r.error || r.errors?.join(', ')} (Product: &quot;{r.title}
                          &quot;)
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '3rem', borderTop: '1px solid #e0e0e0', paddingTop: '2rem' }}>
        <h3>CSV Template Format</h3>
        <p>Your spreadsheet should have these columns (in this exact order):</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>
                Column Name
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>
                Required
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>title_en</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>✓ Yes</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                English product title
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>title_fa</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>✓ Yes</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                Farsi product title
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>price</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>✓ Yes</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                Price in USD (e.g., 19.99)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>status</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>✓ Yes</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                &quot;published&quot; or &quot;draft&quot;
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>image_urls</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>✓ Yes</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                Comma-separated image URLs
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>description_en</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Optional</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                English description
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>description_fa</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Optional</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Farsi description</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>categories</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Optional</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                Comma-separated category names
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>meta_title</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Optional</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>SEO title</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                <code>meta_description</code>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Optional</td>
              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>SEO description</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '1.5rem' }}>
          <p>
            <a
              href="/templates/product-import-template.csv"
              download
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              Download example CSV template
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
