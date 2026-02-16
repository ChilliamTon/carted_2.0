import { useState } from 'react'
import { PriceHistoryChart } from './PriceHistoryChart'
import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  onDelete?: () => void
  isDeleting?: boolean
}

export function ItemCard({ item, onDelete, isDeleting = false }: ItemCardProps) {
  const [showPriceHistory, setShowPriceHistory] = useState(false)

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">

      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center mb-2">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-400">No image</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${
            item.is_available
              ? 'bg-emerald-500/90 text-white'
              : 'bg-rose-500/90 text-white'
          }`}>
            {item.is_available ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowPriceHistory(true)
            }}
            disabled={isDeleting}
            className="p-2 bg-white/90 text-slate-600 hover:text-primary-600 hover:bg-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Price history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
           {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              disabled={isDeleting}
              className="p-2 bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove item"
            >
              {isDeleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5m11 2a8 8 0 10-2.3 5.7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2 flex items-center gap-2">
          {item.merchant && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
              {item.merchant}
            </span>
          )}
        </div>

        <h4 className="font-semibold text-slate-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-primary-700 transition-colors" title={item.title}>
          {item.title}
        </h4>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
            <div className="text-lg font-bold text-slate-900 font-display">
               {item.current_price ? (
                 <>
                   <span className="text-sm font-medium text-slate-500">{item.currency === 'USD' || !item.currency ? '$' : item.currency === 'EUR' ? '\u20AC' : item.currency === 'GBP' ? '\u00A3' : item.currency === 'JPY' ? '\u00A5' : item.currency}</span>{item.current_price.toFixed(2)}
                 </>
               ) : (
                 <span className="text-sm text-slate-400">--</span>
               )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPriceHistory(true)}
              disabled={isDeleting}
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="View price history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-3 py-1.5 h-8 rounded-lg"
            >
              Visit Store
            </a>
          </div>
        </div>
      </div>

      <PriceHistoryChart
        item={item}
        isOpen={showPriceHistory}
        onClose={() => setShowPriceHistory(false)}
      />
    </div>
  )
}
