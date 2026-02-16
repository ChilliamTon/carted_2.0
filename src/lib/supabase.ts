import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_folder_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_folder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          name?: string
          description?: string | null
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          list_id: string
          user_id: string
          title: string
          url: string
          image_url: string | null
          merchant: string | null
          current_price: number | null
          currency: string
          is_available: boolean
          last_checked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          title: string
          url: string
          image_url?: string | null
          merchant?: string | null
          current_price?: number | null
          currency?: string
          is_available?: boolean
          last_checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          title?: string
          url?: string
          image_url?: string | null
          merchant?: string | null
          current_price?: number | null
          currency?: string
          is_available?: boolean
          last_checked_at?: string | null
          updated_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          item_id: string
          price: number
          currency: string
          checked_at: string
        }
        Insert: {
          id?: string
          item_id: string
          price: number
          currency?: string
          checked_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          price?: number
          currency?: string
          checked_at?: string
        }
      }
      availability_history: {
        Row: {
          id: string
          item_id: string
          is_available: boolean
          checked_at: string
        }
        Insert: {
          id?: string
          item_id: string
          is_available: boolean
          checked_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          is_available?: boolean
          checked_at?: string
        }
      }
    }
  }
}
