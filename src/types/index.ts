export interface User {
  id: string
  email: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_folder_id: string | null
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface Item {
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

export interface PriceHistory {
  id: string
  item_id: string
  price: number
  currency: string
  checked_at: string
}
