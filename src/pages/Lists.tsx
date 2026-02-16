import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { ListCard } from '../components/lists/ListCard'

export function Lists() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lists, loading, createList, deleteList } = useLists(user?.id || null)
  const [newListName, setNewListName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newListName.trim()) return

    await createList({
      user_id: user.id,
      name: newListName,
      folder_id: null,
      description: null,
    })

    setNewListName('')
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-2/3 bg-slate-100/50 rounded-t-2xl"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-slate-200/60 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">My Collections</h2>
          <p className="text-slate-500 mt-2 text-lg">Manage and organize your wishlist items.</p>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2 group shadow-lg shadow-primary-500/20"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Collection</span>
          </button>
        )}
      </div>

      {/* Create List Form */}
      <div className={`transition-all duration-300 ease-spring ${showCreateForm ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none absolute'}`}>
        {showCreateForm && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 max-w-2xl mx-auto ring-4 ring-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Create New Collection
              </h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateList} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Birthday Wishlist, Tech Upgrades..."
                className="input-field flex-1"
                autoFocus
              />
              <div className="flex gap-3 sm:w-auto w-full">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No collections yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
            Start by creating a collection to organize your favorite items.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={() => navigate(`/lists/${list.id}`)}
              onDelete={() => deleteList(list.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
