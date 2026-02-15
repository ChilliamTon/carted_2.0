import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  onDelete?: () => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex gap-4">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-24 h-24 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{item.title}</h4>
          {item.merchant && (
            <p className="text-sm text-gray-600">{item.merchant}</p>
          )}
          {item.current_price && (
            <p className="text-lg font-bold text-indigo-600 mt-2">
              {item.currency} {item.current_price.toFixed(2)}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${
              item.is_available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.is_available ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View Product →
          </a>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
