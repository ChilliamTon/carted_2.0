/**
 * Product URL Scraper
 * Extracts product information from URLs using Open Graph meta tags
 * Falls back to generic scraping when possible
 */

export interface ScrapedProduct {
  title: string | null
  price: number | null
  currency: string
  image_url: string | null
  merchant: string | null
  success: boolean
  error?: string
}

/**
 * Scrape product information from a URL
 * Uses CORS proxy to fetch page HTML and extract Open Graph metadata
 */
export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  try {
    // Validate URL
    new URL(url) // Throws if invalid

    // Use CORS proxy to fetch the page
    // Note: For production, replace with your own proxy or Edge Function
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WishlistBot/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()

    // Parse HTML to extract metadata
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    return {
      title: extractTitle(doc, url),
      price: extractPrice(doc),
      currency: extractCurrency(doc),
      image_url: extractImage(doc, url),
      merchant: extractMerchant(url),
      success: true,
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return {
      title: null,
      price: null,
      currency: 'USD',
      image_url: null,
      merchant: extractMerchant(url), // Can still extract merchant from URL
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Extract product title from HTML
 * Priority: Open Graph > Twitter Card > Page Title > H1
 */
function extractTitle(doc: Document, url: string): string | null {
  // Try Open Graph title
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
  if (ogTitle?.trim()) return ogTitle.trim()

  // Try Twitter title
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
  if (twitterTitle?.trim()) return twitterTitle.trim()

  // Try page title (clean up common patterns)
  const pageTitle = doc.querySelector('title')?.textContent
  if (pageTitle?.trim()) {
    // Remove common suffixes like " | Amazon" or " - eBay"
    return pageTitle.trim().replace(/\s+[|-]\s+.+$/, '')
  }

  // Try h1
  const h1 = doc.querySelector('h1')?.textContent
  if (h1?.trim()) return h1.trim()

  // Fallback to domain
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '')
    return `Product from ${domain}`
  } catch {
    return 'Unknown Product'
  }
}

/**
 * Extract price from HTML
 * Looks for Open Graph price metadata and common price selectors
 */
function extractPrice(doc: Document): number | null {
  // Try Open Graph price
  const ogPrice = doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content') ||
                  doc.querySelector('meta[property="product:price:amount"]')?.getAttribute('content')

  if (ogPrice) {
    const price = parsePrice(ogPrice)
    if (price !== null) return price
  }

  // Try schema.org price
  const schemaPrice = doc.querySelector('[itemprop="price"]')?.getAttribute('content') ||
                      doc.querySelector('[itemprop="price"]')?.textContent

  if (schemaPrice) {
    const price = parsePrice(schemaPrice)
    if (price !== null) return price
  }

  // Try common price selectors
  const priceSelectors = [
    '.price',
    '[class*="price"]',
    '[id*="price"]',
    'span[class*="Price"]',
  ]

  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector)
    if (element?.textContent) {
      const price = parsePrice(element.textContent)
      if (price !== null) return price
    }
  }

  return null
}

/**
 * Parse price string to number
 * Handles various currency formats: $123.45, €123,45, 123.45 USD, etc.
 */
function parsePrice(text: string): number | null {
  // Remove currency symbols, commas, and whitespace
  const cleaned = text.replace(/[$€£¥₹,\s]/g, '')

  // Extract first number with optional decimal
  const match = cleaned.match(/\d+\.?\d*/)

  if (match) {
    const price = parseFloat(match[0])
    return isNaN(price) ? null : price
  }

  return null
}

/**
 * Extract currency from HTML
 * Defaults to USD if not found
 */
function extractCurrency(doc: Document): string {
  // Try Open Graph currency
  const ogCurrency = doc.querySelector('meta[property="og:price:currency"]')?.getAttribute('content') ||
                     doc.querySelector('meta[property="product:price:currency"]')?.getAttribute('content')

  if (ogCurrency) return ogCurrency.toUpperCase()

  // Try schema.org currency
  const schemaCurrency = doc.querySelector('[itemprop="priceCurrency"]')?.getAttribute('content')
  if (schemaCurrency) return schemaCurrency.toUpperCase()

  // Default to USD
  return 'USD'
}

/**
 * Extract product image URL
 * Priority: Open Graph > Twitter Card > Product images
 */
function extractImage(doc: Document, baseUrl: string): string | null {
  // Try Open Graph image
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  if (ogImage) return makeAbsoluteUrl(ogImage, baseUrl)

  // Try Twitter image
  const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
  if (twitterImage) return makeAbsoluteUrl(twitterImage, baseUrl)

  // Try schema.org image
  const schemaImage = doc.querySelector('[itemprop="image"]')?.getAttribute('content') ||
                      doc.querySelector('[itemprop="image"]')?.getAttribute('src')
  if (schemaImage) return makeAbsoluteUrl(schemaImage, baseUrl)

  // Try common product image selectors
  const imgSelectors = [
    '.product-image img',
    '[class*="product"] img',
    'img[alt*="product" i]',
    'img[alt*="item" i]',
  ]

  for (const selector of imgSelectors) {
    const img = doc.querySelector(selector)
    if (img) {
      const src = img.getAttribute('src') || img.getAttribute('data-src')
      if (src) return makeAbsoluteUrl(src, baseUrl)
    }
  }

  return null
}

/**
 * Extract merchant/store name from URL
 */
function extractMerchant(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    // Remove www. and extract domain name
    const domain = hostname.replace(/^www\./, '').split('.')[0]

    // Capitalize first letter and handle special cases
    const merchantMap: Record<string, string> = {
      'amazon': 'Amazon',
      'ebay': 'eBay',
      'etsy': 'Etsy',
      'walmart': 'Walmart',
      'target': 'Target',
      'bestbuy': 'Best Buy',
    }

    return merchantMap[domain.toLowerCase()] ||
           domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return null
  }
}

/**
 * Convert relative URL to absolute URL
 */
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

/**
 * Validate if a URL is likely a product page
 * Returns true for valid product URLs, false for homepages/categories
 */
export function isLikelyProductUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.toLowerCase()

    // Check if path contains product indicators
    const productIndicators = ['/product/', '/item/', '/p/', '/dp/', '/listing/']
    const hasProductIndicator = productIndicators.some(indicator => path.includes(indicator))

    // Check if path has multiple segments (not just homepage)
    const hasDeepPath = path.split('/').filter(Boolean).length >= 2

    return hasProductIndicator || hasDeepPath
  } catch {
    return false
  }
}
