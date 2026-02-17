import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLists } from '../hooks/useLists'
import { useFolders } from '../hooks/useFolders'
import { ListCard } from '../components/lists/ListCard'
import { GuidedOnboardingCard } from '../components/onboarding/GuidedOnboardingCard'
import { useToast } from '../components/ui'
import { buildSharedCollectionUrl, sanitizeSharedUrl } from '../lib/share'
import { queryCollections, summarizeCollections, type CollectionSort } from '../lib/collections'
import { getNextBestAction } from '../lib/onboarding'
import { useOnboarding } from '../hooks/useOnboarding'

type CollectionViewMode = 'grid' | 'table'
type BulkMoveChange = {
  collectionId: string
  previousFolderId: string | null
  nextFolderId: string | null
}

const VIEW_MODE_STORAGE_KEY = 'wishlist-central:collections:view-mode'

export function Lists() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { lists, loading, createList, updateList, deleteList } = useLists(user?.id || null)
  const { folders, loading: foldersLoading, createFolder, deleteFolder } = useFolders(user?.id || null)
  const {
    state: onboardingState,
    nextStep,
    progress: onboardingProgress,
    hydrated: onboardingHydrated,
    isGuideVisible,
    dismissGuide,
    completeStep,
    isStepComplete,
  } = useOnboarding(user?.id || null)
  const toast = useToast()

  const [newListName, setNewListName] = useState('')
  const [newListFolderId, setNewListFolderId] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null)
  const [assigningCollectionId, setAssigningCollectionId] = useState<string | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<CollectionSort>('newest')

  const [viewMode, setViewMode] = useState<CollectionViewMode>('grid')
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [bulkFolderId, setBulkFolderId] = useState('')
  const [isBulkMoving, setIsBulkMoving] = useState(false)
  const [lastBulkMoveChanges, setLastBulkMoveChanges] = useState<BulkMoveChange[]>([])

  const sharedUrl = useMemo(
    () => sanitizeSharedUrl(searchParams.get('sharedUrl')),
    [searchParams],
  )
  const shareSource = searchParams.get('source') || 'link'

  const folderNameById = useMemo(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder.name])),
    [folders],
  )

  const activeFolder = selectedFolderId === 'all'
    ? null
    : folders.find((folder) => folder.id === selectedFolderId) || null

  const collectionSummary = useMemo(() => summarizeCollections(lists), [lists])
  const hasActiveSearch = searchQuery.trim().length > 0

  const filteredLists = useMemo(() => {
    return queryCollections(lists, {
      searchQuery,
      selectedFolderId,
      sortBy,
    })
  }, [lists, searchQuery, selectedFolderId, sortBy])

  const selectedCollectionIdSet = useMemo(() => new Set(selectedCollectionIds), [selectedCollectionIds])
  const visibleCollectionIds = useMemo(() => filteredLists.map((list) => list.id), [filteredLists])
  const allVisibleSelected =
    visibleCollectionIds.length > 0 &&
    visibleCollectionIds.every((collectionId) => selectedCollectionIdSet.has(collectionId))

  const primaryCollectionId = filteredLists[0]?.id || lists[0]?.id || null
  const nextBestAction = getNextBestAction({
    page: 'collections',
    state: onboardingState,
    hasCollections: lists.length > 0,
    hasItems: false,
    primaryCollectionId,
  })

  useEffect(() => {
    const intent = searchParams.get('intent')
    if (!intent) return

    if (intent === 'create-collection') {
      setShowCreateForm(true)
    }

    if (intent === 'create-folder') {
      setShowCreateFolderForm(true)
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('intent')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!onboardingHydrated) return
    if (lists.length === 0 || isStepComplete('collections')) return
    completeStep('collections')
  }, [completeStep, isStepComplete, lists.length, onboardingHydrated])

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (saved === 'grid' || saved === 'table') {
      setViewMode(saved)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  useEffect(() => {
    setSelectedCollectionIds((previous) => previous.filter((id) => lists.some((list) => list.id === id)))
  }, [lists])

  useEffect(() => {
    if (!isBulkMode) {
      setSelectedCollectionIds([])
      setBulkFolderId('')
    }
  }, [isBulkMode])

  const clearSharedUrl = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('sharedUrl')
    nextParams.delete('source')
    setSearchParams(nextParams)
  }

  const buildCollectionDestination = (collectionId: string) => {
    if (sharedUrl) {
      return buildSharedCollectionUrl(collectionId, sharedUrl, shareSource)
    }

    return `/collections/${collectionId}`
  }

  const toggleSelectCollection = (collectionId: string) => {
    setSelectedCollectionIds((previous) => {
      if (previous.includes(collectionId)) {
        return previous.filter((id) => id !== collectionId)
      }

      return [...previous, collectionId]
    })
  }

  const toggleSelectAllVisible = () => {
    setSelectedCollectionIds((previous) => {
      if (allVisibleSelected) {
        return previous.filter((id) => !visibleCollectionIds.includes(id))
      }

      return [...new Set([...previous, ...visibleCollectionIds])]
    })
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newListName.trim() || isCreatingCollection) return
    setIsCreatingCollection(true)

    const collectionName = newListName.trim()
    try {
      const { error } = await createList({
        user_id: user.id,
        name: collectionName,
        folder_id: newListFolderId || null,
        description: null,
      })

      if (error) {
        toast.error('Could not create the collection. Please try again.')
      } else {
        toast.success(`"${collectionName}" created`)
        if (!isStepComplete('collections')) {
          completeStep('collections')
        }
        setNewListName('')
        setNewListFolderId('')
        setShowCreateForm(false)
      }
    } finally {
      setIsCreatingCollection(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newFolderName.trim() || isCreatingFolder) return
    setIsCreatingFolder(true)

    const folderName = newFolderName.trim()
    try {
      const { error } = await createFolder({
        user_id: user.id,
        name: folderName,
        parent_folder_id: null,
      })

      if (error) {
        toast.error('Could not create the folder. Please try again.')
      } else {
        toast.success(`Folder "${folderName}" created`)
        setNewFolderName('')
        setShowCreateFolderForm(false)
      }
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteList = async (id: string) => {
    if (deletingCollectionId) return
    setDeletingCollectionId(id)
    try {
      const { error } = await deleteList(id)
      if (error) {
        toast.error('Could not delete the collection. Please try again.')
      } else {
        toast.success('Collection deleted')
        setSelectedCollectionIds((previous) => previous.filter((collectionId) => collectionId !== id))
      }
    } finally {
      setDeletingCollectionId(null)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (deletingFolderId) return
    setDeletingFolderId(id)
    try {
      const { error } = await deleteFolder(id)
      if (error) {
        toast.error('Could not delete the folder. Please try again.')
      } else {
        toast.success('Folder deleted')
        if (selectedFolderId === id) {
          setSelectedFolderId('all')
        }
      }
    } finally {
      setDeletingFolderId(null)
    }
  }

  const handleAssignFolder = async (listId: string, folderId: string | null) => {
    if (assigningCollectionId) return
    setAssigningCollectionId(listId)
    try {
      const { error } = await updateList(listId, { folder_id: folderId })
      if (error) {
        toast.error('Could not update folder assignment. Please try again.')
      } else {
        toast.success(folderId ? 'Collection moved to folder' : 'Collection removed from folder')
      }
    } finally {
      setAssigningCollectionId(null)
    }
  }

  const handleBulkMove = async () => {
    if (selectedCollectionIds.length === 0 || isBulkMoving) return

    setIsBulkMoving(true)
    const targetFolderId = bulkFolderId || null
    const changes: BulkMoveChange[] = selectedCollectionIds.map((collectionId) => ({
      collectionId,
      previousFolderId: lists.find((list) => list.id === collectionId)?.folder_id ?? null,
      nextFolderId: targetFolderId,
    }))
    const failedCollectionIds: string[] = []
    let succeeded = 0
    let failed = 0

    for (const collectionId of selectedCollectionIds) {
      const { error } = await updateList(collectionId, { folder_id: targetFolderId })
      if (error) {
        failed += 1
        failedCollectionIds.push(collectionId)
      } else {
        succeeded += 1
      }
    }

    const appliedChanges = changes.filter(
      (change) => !failedCollectionIds.includes(change.collectionId),
    )

    if (succeeded > 0 && failed === 0) {
      setLastBulkMoveChanges(appliedChanges)
      toast.success(`Moved ${succeeded} collection${succeeded === 1 ? '' : 's'}. Undo is available below.`)
      setIsBulkMode(false)
    } else if (succeeded > 0 && failed > 0) {
      setLastBulkMoveChanges(appliedChanges)
      toast.info(`Moved ${succeeded} collection${succeeded === 1 ? '' : 's'}, ${failed} failed. Retry or undo below.`)
      setSelectedCollectionIds(failedCollectionIds)
    } else {
      toast.error('Bulk move failed. Please try again.')
    }

    setIsBulkMoving(false)
  }

  const handleUndoBulkMove = async () => {
    if (lastBulkMoveChanges.length === 0 || isBulkMoving) return
    setIsBulkMoving(true)

    let succeeded = 0
    let failed = 0
    const failedUndoChanges: BulkMoveChange[] = []

    for (const change of lastBulkMoveChanges) {
      const { error } = await updateList(change.collectionId, { folder_id: change.previousFolderId })
      if (error) {
        failed += 1
        failedUndoChanges.push(change)
      } else {
        succeeded += 1
      }
    }

    if (failed === 0) {
      toast.success(`Undo complete for ${succeeded} collection${succeeded === 1 ? '' : 's'}.`)
      setLastBulkMoveChanges([])
    } else {
      toast.error(`Undo finished with ${failed} failure${failed === 1 ? '' : 's'}. Try again.`)
      setLastBulkMoveChanges(failedUndoChanges)
    }

    setIsBulkMoving(false)
  }

  if (loading || foldersLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="h-2/3 rounded-t-2xl bg-slate-100/50"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {isGuideVisible && (
        <GuidedOnboardingCard
          action={nextBestAction}
          nextStep={nextStep}
          completedSteps={onboardingState.completedSteps}
          progressLabel={`${onboardingProgress.completed}/${onboardingProgress.total} steps complete`}
          onDismissGuide={dismissGuide}
        />
      )}

      <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Collections</h2>
          <p className="mt-1 text-base text-slate-500 sm:mt-2 sm:text-lg">Organize your saved products and track what matters.</p>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={() => setIsBulkMode((previous) => !previous)}
            className="btn-secondary"
          >
            {isBulkMode ? 'Done selecting' : 'Bulk Move'}
          </button>

          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary w-full gap-2 shadow-lg shadow-primary-500/20 sm:w-auto"
            >
              <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Collection</span>
            </button>
          )}
        </div>
      </div>

      {sharedUrl && (
        <section className="rounded-2xl border border-primary-200 bg-primary-50/60 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary-800">
                Link imported from {shareSource === 'extension' ? 'Browser Extension' : 'shared link'}.
              </p>
              <p className="text-sm text-primary-700">
                Pick a collection below to prefill the item form, or clear this link.
              </p>
              <p className="break-all rounded-lg border border-primary-100 bg-white px-3 py-2 text-xs text-slate-600">
                {sharedUrl}
              </p>
            </div>

            <button
              onClick={clearSharedUrl}
              className="btn-secondary w-full sm:w-auto"
            >
              Clear Link
            </button>
          </div>
        </section>
      )}

      {lastBulkMoveChanges.length > 0 && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Bulk move applied to {lastBulkMoveChanges.length} collection{lastBulkMoveChanges.length === 1 ? '' : 's'}.
              </p>
              <p className="text-xs text-emerald-700">
                You can undo this move if it was not intended.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void handleUndoBulkMove()}
                disabled={isBulkMoving}
                className="btn-secondary text-sm disabled:opacity-60"
              >
                {isBulkMoving ? 'Undoing...' : 'Undo Bulk Move'}
              </button>
              <button
                onClick={() => setLastBulkMoveChanges([])}
                className="btn-ghost text-sm"
                disabled={isBulkMoving}
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Collections</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{collectionSummary.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Folders</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{collectionSummary.inFolders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Uncategorized</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{collectionSummary.uncategorized}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Folders</h3>
            <p className="text-sm text-slate-500">Group collections by theme and filter quickly.</p>
          </div>

          {!showCreateFolderForm && (
            <button
              onClick={() => setShowCreateFolderForm(true)}
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>
          )}
        </div>

        {showCreateFolderForm && (
          <form onSubmit={handleCreateFolder} className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Gifts, Tech, Home"
              className="input-field flex-1"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateFolderForm(false)
                  setNewFolderName('')
                }}
                className="btn-secondary"
                disabled={isCreatingFolder}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!newFolderName.trim() || isCreatingFolder}
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            placeholder="Search collections by name or description"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CollectionSort)}
            className="input-field md:w-44"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFolderId('all')}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              selectedFolderId === 'all'
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Collections
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-500">{lists.length}</span>
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 transition-colors ${
                selectedFolderId === folder.id
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-sm font-semibold ${
                  selectedFolderId === folder.id
                    ? 'text-primary-700'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {folder.name}
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-500">
                  {lists.filter((list) => list.folder_id === folder.id).length}
                </span>
              </button>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                title={`Delete folder ${folder.name}`}
                disabled={deletingFolderId === folder.id}
              >
                {deletingFolderId === folder.id ? (
                  <svg className="h-1 w-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h5m11 2a8 8 0 10-2.3 5.7" />
                  </svg>
                ) : (
                  <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {isBulkMode && (
        <section className="rounded-2xl border border-primary-200 bg-primary-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-800">
                {selectedCollectionIds.length} selected
              </p>
              <p className="text-xs text-primary-700">
                Select multiple collections, then move them to a folder in one action.
              </p>
            </div>

            <button
              onClick={toggleSelectAllVisible}
              className="btn-secondary"
              disabled={filteredLists.length === 0}
            >
              {allVisibleSelected ? 'Unselect visible' : 'Select visible'}
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={bulkFolderId}
              onChange={(event) => setBulkFolderId(event.target.value)}
              className="input-field sm:max-w-xs"
            >
              <option value="">Move to: No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  Move to: {folder.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => void handleBulkMove()}
              disabled={selectedCollectionIds.length === 0 || isBulkMoving}
              className="btn-primary"
            >
              {isBulkMoving ? 'Moving...' : 'Move selected'}
            </button>

            <button
              onClick={() => setSelectedCollectionIds([])}
              className="btn-ghost"
              disabled={selectedCollectionIds.length === 0 || isBulkMoving}
            >
              Clear selection
            </button>
          </div>
        </section>
      )}

      <div className={`transition-all duration-300 ease-spring ${showCreateForm ? 'translate-y-0 opacity-100' : '-translate-y-4 pointer-events-none absolute opacity-0'}`}>
        {showCreateForm && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 ring-4 ring-slate-50 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Create New Collection
              </h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Birthday Gifts, Tech Upgrades..."
                className="input-field flex-1"
                autoFocus
              />

              <select
                value={newListFolderId}
                onChange={(e) => setNewListFolderId(e.target.value)}
                className="input-field w-full sm:max-w-xs"
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>

              <div className="flex w-full gap-3 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1 sm:flex-none"
                  disabled={isCreatingCollection}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim() || isCreatingCollection}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {isCreatingCollection ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {filteredLists.length === 0 ? (
        <div className="px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-4 w-4 items-center justify-center rounded-lg border border-primary-100 bg-gradient-to-br from-primary-50 to-indigo-50 shadow-sm">
            <svg className="h-2 w-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-slate-900">
            {hasActiveSearch
              ? `No results for "${searchQuery.trim()}"`
              : activeFolder
                ? `No collections in "${activeFolder.name}"`
                : 'No collections yet'}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-slate-500">
            {hasActiveSearch
              ? 'Try another keyword or clear search to see all collections.'
              : activeFolder
                ? 'Create a collection and assign it to this folder to start organizing.'
                : 'Collections help you organize items you want to track. Create your first one to get started.'}
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            {hasActiveSearch && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary inline-flex items-center gap-2"
              >
                Clear search
              </button>
            )}
            <button
              onClick={() => {
                setShowCreateForm(true)
                if (activeFolder) {
                  setNewListFolderId(activeFolder.id)
                }
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="h-1 w-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
              {activeFolder ? 'Create collection in this folder' : 'Create your first collection'}
            </button>
            {activeFolder && (
              <button
                onClick={() => setSelectedFolderId('all')}
                className="btn-secondary inline-flex items-center gap-2"
              >
                View all collections
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-2 lg:grid-cols-3">
          {filteredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              folderName={list.folder_id ? folderNameById[list.folder_id] : null}
              folderOptions={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
              onAssignFolder={(folderId) => handleAssignFolder(list.id, folderId)}
              selectionEnabled={isBulkMode}
              isSelected={selectedCollectionIdSet.has(list.id)}
              onToggleSelect={() => toggleSelectCollection(list.id)}
              isAssigningFolder={assigningCollectionId === list.id}
              onClick={() => {
                if (isBulkMode) {
                  toggleSelectCollection(list.id)
                  return
                }
                navigate(buildCollectionDestination(list.id))
              }}
              onDelete={() => handleDeleteList(list.id)}
              isDeleting={deletingCollectionId === list.id}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-left">
                <tr>
                  {isBulkMode && (
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        aria-label="Select all visible collections"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Collection</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Folder</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Move</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLists.map((list) => (
                  <tr
                    key={list.id}
                    className={`transition-colors hover:bg-slate-50 ${
                      selectedCollectionIdSet.has(list.id) ? 'bg-primary-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!isBulkMode) return
                      toggleSelectCollection(list.id)
                    }}
                  >
                    {isBulkMode && (
                      <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCollectionIdSet.has(list.id)}
                          onChange={() => toggleSelectCollection(list.id)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          aria-label={`Select ${list.name}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          navigate(buildCollectionDestination(list.id))
                        }}
                        className="text-left"
                      >
                        <p className="text-sm font-semibold text-slate-900 hover:text-primary-700">{list.name}</p>
                        <p className="text-xs text-slate-500">{list.description || 'No description'}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {list.folder_id ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {folderNameById[list.folder_id]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No folder</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(list.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <select
                        value={list.folder_id ?? ''}
                        disabled={assigningCollectionId === list.id}
                        onChange={(event) => handleAssignFolder(list.id, event.target.value || null)}
                        className="input-field !h-9 !py-1 !px-2 text-xs"
                      >
                        <option value="">No folder</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <button
                          onClick={() => navigate(buildCollectionDestination(list.id))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => void handleDeleteList(list.id)}
                          disabled={deletingCollectionId === list.id}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                        >
                          {deletingCollectionId === list.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
