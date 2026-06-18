import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

/**
 * Scrapes one or more URLs via Firecrawl API and returns extracted markdown text.
 * The user provides blog/article links; we extract the writing content for voice analysis.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { urls } = body as { urls: string[] }

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return new Response('Provide at least one URL', { status: 400 })
  }

  if (urls.length > 5) {
    return new Response('Maximum 5 URLs at a time', { status: 400 })
  }

  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return new Response('Firecrawl API key not configured', { status: 500 })
  }

  const results: { url: string; content: string; title?: string; error?: string }[] = []

  // Scrape URLs in parallel
  const scrapePromises = urls.map(async (url) => {
    try {
      const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        return { url, content: '', error: `Scrape failed (${res.status}): ${errText.slice(0, 200)}` }
      }

      const data = await res.json()
      const markdown = data?.data?.markdown || ''
      const title = data?.data?.metadata?.title || ''

      if (!markdown || markdown.length < 50) {
        return { url, content: '', error: 'Page content too short or empty' }
      }

      // Truncate extremely long content to ~8000 chars for AI analysis
      const truncated = markdown.length > 8000 ? markdown.slice(0, 8000) + '\n\n[... truncated]' : markdown

      return { url, content: truncated, title }
    } catch (err) {
      return { url, content: '', error: err instanceof Error ? err.message : 'Unknown error' }
    }
  })

  const scraped = await Promise.all(scrapePromises)
  results.push(...scraped)

  return NextResponse.json({ results })
}
