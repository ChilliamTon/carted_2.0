import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { List } from '../types'

export function useLists(userId: string | null) {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLists([])
      setLoading(false)
      return
    }

    fetchLists()
  }, [userId])

  const fetchLists = async () => {
    try {
      const response = await supabase
        .from('lists')
        .select('*')

      if (!response?.error && response?.data) {
        setLists(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const createList = async (list: Omit<List, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await supabase
        .from('lists')
        .insert(list)
        .select()

      if (!response?.error && response?.data?.[0]) {
        setLists([...lists, response.data[0]])
        return { data: response.data[0], error: null }
      }

      return { data: null, error: response?.error ?? new Error('Failed to create list') }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateList = async (id: string, updates: Partial<List>) => {
    try {
      const response = await supabase
        .from('lists')
        .update(updates)
        .eq('id', id)
        .select()

      if (!response?.error && response?.data?.[0]) {
        setLists(lists.map(l => l.id === id ? response.data[0] : l))
        return { data: response.data[0], error: null }
      }

      return { data: null, error: response?.error ?? new Error('Failed to update list') }
    } catch (error) {
      return { data: null, error }
    }
  }

  const deleteList = async (id: string) => {
    try {
      const response = await supabase
        .from('lists')
        .delete()
        .eq('id', id)

      if (!response?.error) {
        setLists(lists.filter(l => l.id !== id))
      }
      return { error: response?.error ?? null }
    } catch (error) {
      return { error }
    }
  }

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists,
  }
}
