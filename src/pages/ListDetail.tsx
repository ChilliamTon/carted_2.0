import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { useItems } from '../hooks/useItems'
import { ItemCard } from '../components/items/ItemCard'
import { ConfirmDialog, useToast } from '../components/ui'
import { scrapeProductUrl, isLikelyProductUrl } from '../lib/scraper'
import { recheckAllPrices } from '../lib/priceChecker'

export function ListDetail() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const toast = useToast()

  // Fetch lists to get the current list details (name, etc.)
  const { lists, loading: listsLoading, deleteList, updateList } = useLists(user?.id || null)
  const currentList = lists.find(l => l.id === listId)

  // Fetch items for this list
  const { items, loading: itemsLoading, createItem, deleteItem, refetch } = useItems(listId || null)

  // Local state for UI
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isDeletingCollection, setIsDeletingCollection] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  // Price checking state
  const [isCheckingPrices, setIsCheckingPrices] = useState(false)
  const [priceCheckProgress, setPriceCheckProgress] = useState({ completed: 0, total: 0 })

  const handleCheckPrices = async () => {
    if (items.length === 0 || isCheckingPrices) return
    setIsCheckingPrices(true)
    setPriceCheckProgress({ completed: 0, total: items.length })

    try {
      const results = await recheckAllPrices(items, (completed, total) => {
        setPriceCheckProgress({ completed, total })
      })
      const succeeded = results.length
      const failed = items.length - succeeded

      if (succeeded === 0) {
        toast.error('Price check failed for all items.')
      } else if (failed > 0) {
        toast.info(`Checked ${succeeded} item${succeeded === 1 ? '' : 's'}. ${failed} failed.`)
      } else {
        toast.success(`Checked prices for ${succeeded} item${succeeded === 1 ? '' : 's'}.`)
      }

      // Refetch items to show updated prices
      refetch()
    } catch {
      toast.error('Price check failed. Please try again.')
    } finally {
      setIsCheckingPrices(false)
    }
  }

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

    const { error } = await updateList(currentList.id, { name: editedName.trim() })
    if (error) {
      toast.error('Failed to rename collection')
    } else {
      toast.success('Collection renamed')
    }
    setIsEditingName(false)
  }

  const handleDeleteList = async () => {
    if (!currentList || isDeletingCollection) return
    setIsDeletingCollection(true)
    try {
      const { error } = await deleteList(currentList.id)
      if (error) {
        toast.error('Could not delete this collection. Please try again.')
      } else {
        toast.success('Collection deleted')
        navigate('/')
      }
    } finally {
      setIsDeletingCollection(false)
    }
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
    if (!user || !listId || !formData.title || !formData.url || isAddingItem) return
    setIsAddingItem(true)

    try {
      const { error } = await createItem({
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

      if (error) {
        toast.error('Could not add item. Please review the fields and try again.')
        return
      }
      toast.success(`"${formData.title}" added to this collection`)

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
    } finally {
      setIsAddingItem(false)
    }
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
        {/* Back button and Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="text-slate-300">|</span>
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-primary-600 transition-colors">My Collections</Link>
            <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900">{currentList?.name}</span>
          </nav>
        </div>

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
                  className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight cursor-pointer hover:text-primary-700 transition-colors"
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group shadow-lg shadow-primary-500/20"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Item</span>
              </button>
            )}
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  onClick={handleCheckPrices}
                  disabled={isCheckingPrices}
                  className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  title="Check all prices"
                >
                  <svg className={`w-4 h-4 ${isCheckingPrices ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isCheckingPrices
                    ? `Checking ${priceCheckProgress.completed}/${priceCheckProgress.total}...`
                    : 'Check Prices Now'}
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Collection"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
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
                  {isScraping && <span className="ml-2 text-xs text-primary-600 font-normal">Extracting product details...</span>}
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
                disabled={isAddingItem}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingItem}
                className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingItem ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5m11 2a8 8 0 10-2.3 5.7" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No items yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8 text-base leading-relaxed">
            Add product URLs and we'll track their prices for you. Paste a link to get started.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add your first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isDeleting={deletingItemId === item.id}
              onDelete={async () => {
                if (deletingItemId) return
                setDeletingItemId(item.id)
                const { error } = await deleteItem(item.id)
                if (error) {
                  toast.error('Could not remove the item. Please try again.')
                } else {
                  toast.success('Item removed')
                }
                setDeletingItemId(null)
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={() => {
          setShowDeleteConfirm(false)
          handleDeleteList()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Collection"
        message={`Are you sure you want to delete "${currentList?.name}"? All items in this collection will be permanently removed. This action cannot be undone.`}
        confirmLabel={isDeletingCollection ? 'Deleting...' : 'Delete'}
        variant="danger"
      />
    </div>
  )
}
