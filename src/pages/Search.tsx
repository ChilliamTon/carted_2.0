import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { supabase } from '../lib/supabase'
import {
  searchCollectionsAndItems,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  getFilterSummary,
  type SearchFilters,
  type SearchResult,
} from '../lib/search'
import type { Item } from '../types'
import { PageHeader } from '../components/layout/PageHeader'

export function Search() {
  const { user } = useAuth()
  const { lists, loading: listsLoading } = useLists(user?.id || null)
  const [allItems, setAllItems] = useState<Item[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)

  useEffect(() => {
    const loadAllItems = async () => {
      if (!user?.id) {
        setItemsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from('items').select('*')

        if (!error && data) {
          setAllItems(data)
        }
      } catch (err) {
        console.error('Failed to load items:', err)
      } finally {
        setItemsLoading(false)
      }
    }

    loadAllItems()
  }, [user?.id])

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    collections: [],
    priceRange: null,
    availability: 'all',
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  const results = useMemo(() => {
    return searchCollectionsAndItems(query, lists, allItems, filters)
  }, [query, lists, allItems, filters])

  const hasResults = results.collections.length > 0 || results.items.length > 0
  const totalResults = results.collections.length + results.items.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addToSearchHistory(query)
      setSearchHistory(getSearchHistory())
      setShowHistory(false)
    }
  }

  const handleHistorySelect = (item: string) => {
    setQuery(item)
    setShowHistory(false)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setSearchHistory([])
  }

  const handleClearFilters = () => {
    setFilters({
      collections: [],
      priceRange: null,
      availability: 'all',
    })
  }

  const hasActiveFilter =
    filters.collections.length > 0 || filters.priceRange || filters.availability !== 'all'

  const minPrice =
    allItems.length > 0
      ? Math.min(...allItems.map((i) => i.current_price ?? 0).filter((p) => p > 0))
      : 0
  const maxPrice = allItems.length > 0 ? Math.max(...allItems.map((i) => i.current_price ?? 0)) : 1000

  if (itemsLoading || listsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Global Search"
        description="Search across all your collections and items."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Search' },
        ]}
        actions={
          <Link to="/collections" className="btn-secondary text-sm">
            Open Collections
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-1 w-1 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="Search collections, items, merchants..."
              className="input-field !pl-10 w-full"
              aria-label="Search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {showHistory && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
              {searchHistory.length > 0 ? (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Recent Searches
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleHistorySelect(item)}
                        className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  No search history yet
                </div>
              )}
            </div>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Filters</h3>
          {hasActiveFilter && (
            <button
              onClick={handleClearFilters}
              className="btn-ghost text-sm"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Collections</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lists.map((list) => (
                <label key={list.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.collections.includes(list.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({
                          ...filters,
                          collections: [...filters.collections, list.id],
                        })
                      } else {
                        setFilters({
                          ...filters,
                          collections: filters.collections.filter((id) => id !== list.id),
                        })
                      }
                    }}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">{list.name}</span>
                </label>
              ))}
            </div>
          </div>

          {allItems.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price Range: ${filters.priceRange?.[0] ?? minPrice} - $
                  {filters.priceRange?.[1] ?? maxPrice}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={Math.floor(minPrice)}
                    max={Math.ceil(maxPrice)}
                    value={filters.priceRange?.[0] ?? minPrice}
                    onChange={(e) => {
                      const min = parseInt(e.target.value)
                      const max = filters.priceRange?.[1] ?? maxPrice
                      if (min <= max) {
                        setFilters({
                          ...filters,
                          priceRange: [min, max],
                        })
                      }
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={Math.floor(minPrice)}
                    max={Math.ceil(maxPrice)}
                    value={filters.priceRange?.[1] ?? maxPrice}
                    onChange={(e) => {
                      const max = parseInt(e.target.value)
                      const min = filters.priceRange?.[0] ?? minPrice
                      if (min <= max) {
                        setFilters({
                          ...filters,
                          priceRange: [min, max],
                        })
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Availability
                </label>
                <div className="space-y-2">
                  {['all', 'available', 'unavailable'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={option}
                        checked={filters.availability === option}
                        onChange={() => {
                          setFilters({
                            ...filters,
                            availability: option as SearchFilters['availability'],
                          })
                        }}
                        className="rounded-full border-slate-300 text-primary-600"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {option === 'all' ? 'All Items' : option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!query.trim() && !hasActiveFilter ? (
          <div className="text-center py-8 text-slate-600">
            <svg
              className="mx-auto h-2.5 w-2.5 text-slate-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm">Enter a search query or apply filters to get started</p>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-8 text-slate-600">
            <svg
              className="mx-auto h-2.5 w-2.5 text-slate-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">No results found for your search</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                {totalResults} result{totalResults === 1 ? '' : 's'}
              </h3>
              <span className="text-xs text-slate-500">{getFilterSummary(filters)}</span>
            </div>

            {results.collections.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                  Collections ({results.collections.length})
                </h4>
                <div className="space-y-2">
                  {results.collections.map((result) => (
                    <Link
                      key={result.id}
                      to={`/collections/${result.id}`}
                      className="block rounded-lg border border-slate-200 p-4 hover:border-primary-300 hover:bg-primary-50 transition"
                    >
                      <p className="font-semibold text-slate-900">{result.title}</p>
                      {result.description && (
                        <p className="mt-1 text-sm text-slate-600">{result.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.items.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                  Items ({results.items.length})
                </h4>
                <div className="space-y-3">
                  {results.items.map((result) => (
                    <ItemSearchResult key={result.id} result={result} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function ItemSearchResult({ result }: { result: SearchResult }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4 hover:border-primary-300 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/collections/${result.collectionId}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {result.collectionName}
          </Link>
          <p className="mt-1 font-semibold text-slate-900">{result.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {result.merchant && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {result.merchant}
              </span>
            )}
            {result.price !== null && result.price !== undefined && (
              <span className="text-sm font-medium text-slate-700">
                {result.currency === 'USD' ? '$' : result.currency}{result.price.toFixed(2)}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                result.isAvailable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {result.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/items/${result.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            Open Item
          </Link>
          {result.collectionId && (
            <Link
              to={`/collections/${result.collectionId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              Collection
              <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
