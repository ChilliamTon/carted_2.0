// Supabase Edge Function for product scraping
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedProduct {
  title: string | null
  price: number | null
  currency: string
  image_url: string | null
  merchant: string | null
  success: boolean
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the product page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    // Extract product information
    const result: ScrapedProduct = {
      title: extractTitle(doc, url),
      price: extractPrice(doc),
      currency: 'USD', // Default, can be enhanced
      image_url: extractImage(doc, url),
      merchant: extractMerchant(url),
      success: true,
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        title: null,
        price: null,
        currency: 'USD',
        image_url: null,
        merchant: null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractTitle(doc: any, url: string): string | null {
  // Try Open Graph title
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
  if (ogTitle) return ogTitle.trim()

  // Try Twitter title
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
  if (twitterTitle) return twitterTitle.trim()

  // Try page title
  const pageTitle = doc.querySelector('title')?.textContent
  if (pageTitle) return pageTitle.trim()

  // Try h1
  const h1 = doc.querySelector('h1')?.textContent
  if (h1) return h1.trim()

  // Fallback to domain
  try {
    const domain = new URL(url).hostname
    return `Product from ${domain}`
  } catch {
    return 'Unknown Product'
  }
}

function extractPrice(doc: any): number | null {
  // Try common price selectors
  const selectors = [
    '[itemprop="price"]',
    '.price',
    '[class*="price"]',
    '[id*="price"]',
    'meta[property="og:price:amount"]',
  ]

  for (const selector of selectors) {
    const element = doc.querySelector(selector)
    if (!element) continue

    // Try content attribute first (for meta tags)
    const content = element.getAttribute('content')
    if (content) {
      const price = parsePrice(content)
      if (price !== null) return price
    }

    // Try text content
    const text = element.textContent
    if (text) {
      const price = parsePrice(text)
      if (price !== null) return price
    }
  }

  return null
}

function parsePrice(text: string): number | null {
  // Remove currency symbols and extract numbers
  const cleaned = text.replace(/[$€£¥₹,\s]/g, '')
  const match = cleaned.match(/\d+\.?\d*/)

  if (match) {
    const price = parseFloat(match[0])
    return isNaN(price) ? null : price
  }

  return null
}

function extractImage(doc: any, url: string): string | null {
  // Try Open Graph image
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  if (ogImage) return makeAbsoluteUrl(ogImage, url)

  // Try Twitter image
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
  if (twitterImage) return makeAbsoluteUrl(twitterImage, url)

  // Try product image selectors
  const imgSelectors = [
    '[itemprop="image"]',
    '.product-image img',
    '[class*="product"] img',
    'img[alt*="product"]'
  ]

  for (const selector of imgSelectors) {
    const img = doc.querySelector(selector)
    if (img) {
      const src = img.getAttribute('src') || img.getAttribute('data-src')
      if (src) return makeAbsoluteUrl(src, url)
    }
  }

  return null
}

function extractMerchant(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    // Remove www. and extract domain name
    const domain = hostname.replace(/^www\./, '').split('.')[0]
    // Capitalize first letter
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return null
  }
}

function makeAbsoluteUrl(urlStr: string, baseUrl: string): string {
  try {
    // If already absolute, return as-is
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      return urlStr
    }

    // Make absolute using base URL
    const base = new URL(baseUrl)
    return new URL(urlStr, base.origin).href
  } catch {
    return urlStr
  }
}
