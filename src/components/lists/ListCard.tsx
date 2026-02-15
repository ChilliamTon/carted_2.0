import type { List } from '../../types'

interface ListCardProps {
  list: List
  onClick?: () => void
  onDelete?: () => void
}

export function ListCard({ list, onClick, onDelete }: ListCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
          {list.description && (
            <p className="text-sm text-gray-600 mt-1">{list.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created {new Date(list.created_at).toLocaleDateString()}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-500 hover:text-red-700 text-sm ml-4"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
