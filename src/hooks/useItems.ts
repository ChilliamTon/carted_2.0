import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'

export function useItems(listId: string | null) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId) {
      setItems([])
      setLoading(false)
      return
    }

    fetchItems()
  }, [listId])

  const fetchItems = async () => {
    if (!listId) return

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', listId)

    if (!error && data) {
      setItems(data)
    }
    setLoading(false)
  }

  const createItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()

    if (!error && data) {
      setItems([...items, data[0]])
      return { data: data[0], error: null }
    }
    return { data: null, error }
  }

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()

    if (!error && data) {
      setItems(items.map(i => i.id === id ? data[0] : i))
      return { data: data[0], error: null }
    }
    return { data: null, error }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (!error) {
      setItems(items.filter(i => i.id !== id))
    }
    return { error }
  }

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  }
}
