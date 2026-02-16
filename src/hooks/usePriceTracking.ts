import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { scrapeProductUrl } from '../lib/scraper'
import type { Item, PriceHistory, PriceCheckResult, PriceCheckStatus } from '../types'

export function usePriceTracking() {
  const [status, setStatus] = useState<PriceCheckStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const fetchPriceHistory = useCallback(async (itemId: string): Promise<PriceHistory[]> => {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('item_id', itemId)
      .order('checked_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch price history:', error)
      return []
    }
    return data ?? []
  }, [])

  const checkPrice = useCallback(async (item: Item): Promise<PriceCheckResult | null> => {
    setStatus('checking')
    setError(null)

    try {
      const scraped = await scrapeProductUrl(item.url)

      if (!scraped.success || scraped.price === null) {
        setStatus('error')
        setError(scraped.error ?? 'Could not extract price')
        return null
      }

      const previousPrice = item.current_price
      const newPrice = scraped.price
      const priceChange = previousPrice !== null ? newPrice - previousPrice : null
      let priceDirection: PriceCheckResult['price_direction'] = null
      if (priceChange !== null) {
        if (priceChange < 0) priceDirection = 'down'
        else if (priceChange > 0) priceDirection = 'up'
        else priceDirection = 'same'
      }

      const now = new Date().toISOString()

      // Record price in history
      await supabase.from('price_history').insert({
        item_id: item.id,
        price: newPrice,
        currency: scraped.currency,
        checked_at: now,
      })

      // Record availability
      await supabase.from('availability_history').insert({
        item_id: item.id,
        is_available: true,
        checked_at: now,
      })

      // Update item with latest price
      await supabase
        .from('items')
        .update({
          current_price: newPrice,
          currency: scraped.currency,
          is_available: true,
          last_checked_at: now,
        })
        .eq('id', item.id)

      const result: PriceCheckResult = {
        item_id: item.id,
        price: newPrice,
        currency: scraped.currency,
        is_available: true,
        checked_at: now,
        previous_price: previousPrice,
        price_change: priceChange,
        price_direction: priceDirection,
      }

      setStatus('success')
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Price check failed'
      setError(message)
      setStatus('error')
      return null
    }
  }, [])

  const checkMultiplePrices = useCallback(async (
    items: Item[],
    onProgress?: (completed: number, total: number) => void,
  ): Promise<PriceCheckResult[]> => {
    setStatus('checking')
    setError(null)
    const results: PriceCheckResult[] = []

    for (let i = 0; i < items.length; i++) {
      const result = await checkPrice(items[i])
      if (result) results.push(result)
      onProgress?.(i + 1, items.length)
    }

    setStatus(results.length > 0 ? 'success' : 'error')
    return results
  }, [checkPrice])

  const getPriceSummary = useCallback((history: PriceHistory[]) => {
    if (history.length === 0) return null

    const prices = history.map(h => h.price)
    const latest = history[history.length - 1]
    const oldest = history[0]

    return {
      current: latest.price,
      lowest: Math.min(...prices),
      highest: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      totalChange: latest.price - oldest.price,
      dataPoints: history.length,
      firstChecked: oldest.checked_at,
      lastChecked: latest.checked_at,
    }
  }, [])

  return {
    status,
    error,
    fetchPriceHistory,
    checkPrice,
    checkMultiplePrices,
    getPriceSummary,
  }
}
