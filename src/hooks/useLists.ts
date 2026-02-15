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
    const { data, error } = await supabase
      .from('lists')
      .select('*')

    if (!error && data) {
      setLists(data)
    }
    setLoading(false)
  }

  const createList = async (list: Omit<List, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('lists')
      .insert(list)
      .select()

    if (!error && data) {
      setLists([...lists, data[0]])
      return { data: data[0], error: null }
    }
    return { data: null, error }
  }

  const updateList = async (id: string, updates: Partial<List>) => {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', id)
      .select()

    if (!error && data) {
      setLists(lists.map(l => l.id === id ? data[0] : l))
      return { data: data[0], error: null }
    }
    return { data: null, error }
  }

  const deleteList = async (id: string) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)

    if (!error) {
      setLists(lists.filter(l => l.id !== id))
    }
    return { error }
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
