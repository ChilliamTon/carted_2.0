import { useState } from 'react'
import { ConfirmDialog } from '../ui'
import type { List } from '../../types'

interface ListCardProps {
  list: List
  onClick?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function ListCard({ list, onClick, onDelete, isDeleting = false }: ListCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // Deterministic gradient based on list ID
  const getGradient = (id: string) => {
    const gradients = [
      'from-violet-500 to-fuchsia-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-rose-400 to-red-500'
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
  }

  const gradient = getGradient(list.id);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl cursor-pointer border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Visual Header */}
        <div className={`h-24 bg-gradient-to-br ${gradient} p-5 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {list.name}
            </h3>
          </div>

          <p className={`text-sm flex-1 ${list.description ? 'text-slate-500' : 'text-slate-400 italic'}`}>
            {list.description || 'No description provided'}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(list.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(true)
                }}
                disabled={isDeleting}
                className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete collection"
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
      </div>

      {onDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onConfirm={() => {
            setShowDeleteConfirm(false)
            onDelete()
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          title="Delete Collection"
          message={`Are you sure you want to delete "${list.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  )
}
