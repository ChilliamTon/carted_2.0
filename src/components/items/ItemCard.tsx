import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  onDelete?: () => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
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
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">No Image</span>
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

        {/* Action Overlay (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
           {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="p-2 bg-white/90 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg shadow-sm transition-colors"
              title="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
                   <span className="text-sm font-medium text-slate-500 mr-0.5 align-top">{item.currency || '$'}</span>
                   {item.current_price.toFixed(2)}
                 </>
               ) : (
                 <span className="text-sm text-slate-400">--</span>
               )}
            </div>
          </div>

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
  )
}
