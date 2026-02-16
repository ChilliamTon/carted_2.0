import { supabase } from './supabase'
import { scrapeProductUrl } from './scraper'
import type { Item, PriceCheckResult } from '../types'

/**
 * Recheck the price of a single item by scraping its URL,
 * recording the result in price_history, and updating the item.
 */
export async function recheckItemPrice(item: Item): Promise<PriceCheckResult | null> {
  const scraped = await scrapeProductUrl(item.url)

  if (!scraped.success || scraped.price === null) {
    return null
  }

  const previousPrice = item.current_price
  const newPrice = scraped.price
  const now = new Date().toISOString()

  // Only record history if price actually changed or there's no history yet
  const priceChanged = previousPrice === null || previousPrice !== newPrice

  if (priceChanged) {
    await supabase.from('price_history').insert({
      item_id: item.id,
      price: newPrice,
      currency: scraped.currency,
      checked_at: now,
    })
  }

  // Always update item with latest check timestamp
  await supabase
    .from('items')
    .update({
      current_price: newPrice,
      currency: scraped.currency,
      is_available: true,
      last_checked_at: now,
    })
    .eq('id', item.id)

  const priceChange = previousPrice !== null ? newPrice - previousPrice : null
  let priceDirection: PriceCheckResult['price_direction'] = null
  if (priceChange !== null) {
    if (priceChange < 0) priceDirection = 'down'
    else if (priceChange > 0) priceDirection = 'up'
    else priceDirection = 'same'
  }

  return {
    item_id: item.id,
    price: newPrice,
    currency: scraped.currency,
    is_available: true,
    checked_at: now,
    previous_price: previousPrice,
    price_change: priceChange,
    price_direction: priceDirection,
  }
}

/**
 * Recheck prices for all items in a list.
 * Processes sequentially to avoid overwhelming the scraper/proxy.
 */
export async function recheckAllPrices(
  items: Item[],
  onProgress?: (completed: number, total: number, result: PriceCheckResult | null) => void,
): Promise<PriceCheckResult[]> {
  const results: PriceCheckResult[] = []

  for (let i = 0; i < items.length; i++) {
    let result: PriceCheckResult | null = null
    try {
      result = await recheckItemPrice(items[i])
      if (result) results.push(result)
    } catch {
      // Continue checking other items even if one fails
    }
    onProgress?.(i + 1, items.length, result)
  }

  return results
}
