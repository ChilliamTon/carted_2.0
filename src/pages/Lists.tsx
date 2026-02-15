import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { ListCard } from '../components/lists/ListCard'

export function Lists() {
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your lists</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Lists</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showCreateForm ? 'Cancel' : '+ New List'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateList} className="mb-6 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {lists.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No lists yet. Create your first wishlist!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={() => window.location.href = `/lists/${list.id}`}
              onDelete={() => deleteList(list.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
