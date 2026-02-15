-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Folders table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lists table
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Product metadata
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  merchant TEXT,
  current_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',

  -- Tracking
  is_available BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history table
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability history table
CREATE TABLE availability_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  is_available BOOLEAN NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_list_id ON items(list_id);
CREATE INDEX idx_lists_folder_id ON lists(folder_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_price_history_item_id ON price_history(item_id);
CREATE INDEX idx_availability_history_item_id ON availability_history(item_id);

-- Row Level Security (RLS) policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_history ENABLE ROW LEVEL SECURITY;

-- Folders policies
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Lists policies
CREATE POLICY "Users can view their own lists"
  ON lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON lists FOR DELETE
  USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Price history policies
CREATE POLICY "Users can view price history for their items"
  ON price_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM items WHERE items.id = price_history.item_id AND items.user_id = auth.uid()
  ));

-- Availability history policies
CREATE POLICY "Users can view availability history for their items"
  ON availability_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM items WHERE items.id = availability_history.item_id AND items.user_id = auth.uid()
  ));
