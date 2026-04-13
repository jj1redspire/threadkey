-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Series table
CREATE TABLE tk_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  genre text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Books table
CREATE TABLE tk_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  book_number integer NOT NULL,
  file_url text,
  chapter_count integer,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','complete','error')),
  uploaded_at timestamptz DEFAULT now()
);

-- Chunks table (stores text chunks + embeddings)
CREATE TABLE tk_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES tk_books(id) ON DELETE CASCADE NOT NULL,
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  book_number integer,
  chapter_number integer,
  chunk_index integer,
  created_at timestamptz DEFAULT now()
);

-- Characters table
CREATE TABLE tk_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  physical_description jsonb DEFAULT '[]',
  personality_traits jsonb DEFAULT '[]',
  relationships jsonb DEFAULT '[]',
  first_appearance text,
  key_events jsonb DEFAULT '[]',
  source_refs jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Locations table
CREATE TABLE tk_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  significance text,
  source_refs jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Timeline events table
CREATE TABLE tk_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  event text NOT NULL,
  who_involved jsonb DEFAULT '[]',
  when_occurred text,
  consequences text,
  source_refs jsonb DEFAULT '[]',
  event_order integer,
  created_at timestamptz DEFAULT now()
);

-- World rules table
CREATE TABLE tk_world_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  category text,
  rule_description text NOT NULL,
  details text,
  source_refs jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Continuity checks table
CREATE TABLE tk_continuity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES tk_series(id) ON DELETE CASCADE NOT NULL,
  input_text text,
  flags jsonb DEFAULT '[]',
  confirmed_count integer DEFAULT 0,
  contradiction_count integer DEFAULT 0,
  checked_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE tk_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_sub_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Vector similarity index for chunks
CREATE INDEX ON tk_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS: Enable on all tables
ALTER TABLE tk_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_world_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_continuity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tk_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_own_series" ON tk_series FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_books" ON tk_books FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_chunks" ON tk_chunks FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_characters" ON tk_characters FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_locations" ON tk_locations FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_timeline" ON tk_timeline_events FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_world_rules" ON tk_world_rules FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_checks" ON tk_continuity_checks FOR ALL USING (
  series_id IN (SELECT id FROM tk_series WHERE user_id = auth.uid())
);
CREATE POLICY "users_own_subscriptions" ON tk_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Vector similarity search function used by query and continuity routes
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_series_id uuid,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  content text,
  book_number integer,
  chapter_number integer,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id,
    tc.content,
    tc.book_number,
    tc.chapter_number,
    tc.chunk_index,
    1 - (tc.embedding <=> query_embedding) AS similarity
  FROM tk_chunks tc
  WHERE tc.series_id = match_series_id
    AND tc.embedding IS NOT NULL
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
