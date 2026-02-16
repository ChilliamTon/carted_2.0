import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { useItems } from '../hooks/useItems'
import { ItemCard } from '../components/items/ItemCard'
import { scrapeProductUrl, isLikelyProductUrl } from '../lib/scraper'
import type { Item } from '../types'

export function ListDetail() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Fetch lists to get the current list details (name, etc.)
  const { lists, loading: listsLoading, deleteList, updateList } = useLists(user?.id || null)
  const currentList = lists.find(l => l.id === listId)

  // Fetch items for this list
  const { items, loading: itemsLoading, createItem, deleteItem } = useItems(listId || null)

  // Local state for UI
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    image_url: '',
    merchant: '',
    price: '',
    currency: 'USD'
  })
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  // Sync edited name when list loads
  useEffect(() => {
    if (currentList) {
      setEditedName(currentList.name)
    }
  }, [currentList])

  const handleUpdateListName = async () => {
    if (!currentList || !editedName.trim() || editedName === currentList.name) {
      setIsEditingName(false)
      return
    }
    
    await updateList(currentList.id, { name: editedName.trim() })
    setIsEditingName(false)
  }

  const handleDeleteList = async () => {
    if (!currentList || !window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) return
    
    await deleteList(currentList.id)
    navigate('/')
  }

  const handleUrlChange = async (url: string) => {
    setFormData({ ...formData, url })
    setScrapeError(null)

    // Auto-scrape if it looks like a product URL
    if (isLikelyProductUrl(url)) {
      setIsScraping(true)
      try {
        const scraped = await scrapeProductUrl(url)

        if (scraped.success) {
          // Auto-fill form with scraped data
          setFormData(prev => ({
            ...prev,
            url,
            title: scraped.title || prev.title,
            image_url: scraped.image_url || prev.image_url,
            merchant: scraped.merchant || prev.merchant,
            price: scraped.price ? scraped.price.toString() : prev.price,
            currency: scraped.currency || prev.currency,
          }))
        } else {
          setScrapeError(scraped.error || 'Could not scrape product information')
        }
      } catch (error) {
        console.error('Scraping failed:', error)
        setScrapeError('Failed to scrape product information')
      } finally {
        setIsScraping(false)
      }
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !listId || !formData.title || !formData.url) return

    await createItem({
      list_id: listId,
      user_id: user.id,
      title: formData.title,
      url: formData.url,
      image_url: formData.image_url || null,
      merchant: formData.merchant || null,
      current_price: formData.price ? parseFloat(formData.price) : null,
      currency: formData.currency,
      is_available: true,
      last_checked_at: new Date().toISOString()
    })

    // Reset form
    setFormData({
      title: '',
      url: '',
      image_url: '',
      merchant: '',
      price: '',
      currency: 'USD'
    })
    setScrapeError(null)
    setShowAddForm(false)
  }

  // Loading State
  if (listsLoading || (itemsLoading && !items.length)) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // 404 State
  if (!listsLoading && !currentList) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Collection not found</h2>
        <p className="text-slate-500 mt-2">The collection you're looking for doesn't exist or has been deleted.</p>
        <Link to="/" className="btn-primary mt-6">Return to Collections</Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-6 border-b border-slate-200/60 pb-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">My Collections</Link>
          <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 truncate max-w-[200px]">{currentList?.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="flex-1 w-full">
            {isEditingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleUpdateListName}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateListName()}
                  className="text-3xl font-bold text-slate-900 font-display tracking-tight bg-white border border-primary-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-lg"
                  autoFocus
                />
              </div>
            ) : (
              <div className="group flex items-center gap-3">
                <h1 
                  onClick={() => setIsEditingName(true)}
                  className="text-3xl font-bold text-slate-900 font-display tracking-tight cursor-pointer hover:text-primary-700 transition-colors"
                  title="Click to edit name"
                >
                  {currentList?.name}
                </h1>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-300 group-hover:text-slate-500 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-slate-500 mt-2 text-lg">
              {items.length} {items.length === 1 ? 'item' : 'items'} in this collection
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button
              onClick={() => handleDeleteList()}
              className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Collection"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex-1 sm:flex-none flex items-center gap-2 group shadow-lg shadow-primary-500/20"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Item</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className={`transition-all duration-500 ease-spring ${showAddForm ? 'translate-y-0 opacity-100 max-h-[800px]' : '-translate-y-4 opacity-0 max-h-0 overflow-hidden pointer-events-none'}`}>
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 ring-4 ring-slate-50 relative z-10">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
              Add New Item
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAddItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Item Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Product URL <span className="text-red-500">*</span>
                  {isScraping && <span className="ml-2 text-xs text-primary-600 font-normal">Scraping...</span>}
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://amazon.com/..."
                  className="input-field"
                  disabled={isScraping}
                />
                {scrapeError && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {scrapeError} - You can still fill the form manually
                  </p>
                )}
                {!scrapeError && formData.title && formData.url && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Product info auto-filled! Review and edit if needed
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Merchant / Store</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={e => setFormData({...formData, merchant: e.target.value})}
                  placeholder="e.g. Amazon, Best Buy"
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="input-field pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Currency</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="input-field"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-8"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto mb-6 -rotate-3">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No items yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
            This collection is empty. Add your first item above!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
