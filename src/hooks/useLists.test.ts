import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useLists } from './useLists'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('useLists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch lists for a user', async () => {
    const mockLists = [
      { id: '1', user_id: 'user-1', name: 'Wishlist 1', folder_id: null, description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '2', user_id: 'user-1', name: 'Wishlist 2', folder_id: null, description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]

    const { supabase } = await import('../lib/supabase')
    const mockSelect = vi.fn().mockResolvedValue({ data: mockLists, error: null })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const { result } = renderHook(() => useLists('user-1'))

    await waitFor(() => {
      expect(result.current.lists).toEqual(mockLists)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should create a new list', async () => {
    const newList = { user_id: 'user-1', name: 'New List', folder_id: null }
    const createdList = { id: '3', ...newList, description: null, created_at: '2024-01-01', updated_at: '2024-01-01' }

    const { supabase } = await import('../lib/supabase')
    const mockSelect = vi.fn().mockResolvedValue({ data: [createdList], error: null })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert, select: vi.fn() } as any)

    const { result } = renderHook(() => useLists(null))
    let response: Awaited<ReturnType<typeof result.current.createList>> | undefined

    await act(async () => {
      response = await result.current.createList(newList)
    })

    expect(response?.data).toEqual(createdList)
    expect(response?.error).toBeNull()
    expect(mockInsert).toHaveBeenCalledWith(newList)
  })

  it('should update a list', async () => {
    const updates = { name: 'Updated List' }
    const updatedList = { id: '1', user_id: 'user-1', name: 'Updated List', folder_id: null, description: null, created_at: '2024-01-01', updated_at: '2024-01-02' }

    const { supabase } = await import('../lib/supabase')
    const mockSelect = vi.fn().mockResolvedValue({ data: [updatedList], error: null })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate, select: vi.fn() } as any)

    const { result } = renderHook(() => useLists(null))
    let response: Awaited<ReturnType<typeof result.current.updateList>> | undefined

    await act(async () => {
      response = await result.current.updateList('1', updates)
    })

    expect(response?.data).toEqual(updatedList)
    expect(response?.error).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith(updates)
  })

  it('should delete a list', async () => {
    const { supabase } = await import('../lib/supabase')
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete, select: vi.fn() } as any)

    const { result } = renderHook(() => useLists(null))
    let response: Awaited<ReturnType<typeof result.current.deleteList>> | undefined

    await act(async () => {
      response = await result.current.deleteList('1')
    })

    expect(response?.error).toBeNull()
    expect(mockDelete).toHaveBeenCalled()
  })
})
