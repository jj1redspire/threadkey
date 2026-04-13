export interface Series {
  id: string;
  user_id: string;
  name: string;
  genre: string | null;
  description: string | null;
  created_at: string;
  // optional computed fields
  book_count?: number;
  character_count?: number;
  location_count?: number;
  event_count?: number;
}

export interface Book {
  id: string;
  series_id: string;
  title: string;
  book_number: number;
  file_url: string | null;
  chapter_count: number | null;
  processing_status: 'pending' | 'processing' | 'complete' | 'error';
  uploaded_at: string;
}

export interface Chunk {
  id: string;
  book_id: string;
  series_id: string;
  content: string;
  embedding: number[] | null;
  book_number: number | null;
  chapter_number: number | null;
  chunk_index: number | null;
  created_at: string;
}

export interface CharacterRelationship {
  character: string;
  relationship: string;
}

export interface SourceRef {
  book_number: number;
  chapter_number: number;
  excerpt?: string;
}

export interface Character {
  id: string;
  series_id: string;
  name: string;
  physical_description: string[];
  personality_traits: string[];
  relationships: CharacterRelationship[];
  first_appearance: string | null;
  key_events: string[];
  source_refs: SourceRef[];
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  series_id: string;
  name: string;
  description: string | null;
  significance: string | null;
  source_refs: SourceRef[];
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  series_id: string;
  event: string;
  who_involved: string[];
  when_occurred: string | null;
  consequences: string | null;
  source_refs: SourceRef[];
  event_order: number | null;
  created_at: string;
}

export interface WorldRule {
  id: string;
  series_id: string;
  category: string | null;
  rule_description: string;
  details: string | null;
  source_refs: SourceRef[];
  created_at: string;
}

export type ContinuityFlagStatus = 'contradiction' | 'confirmed' | 'no_data';

export interface ContinuityFlag {
  claim: string;
  category: string;
  character?: string;
  status: ContinuityFlagStatus;
  explanation: string;
  source?: string;
  existing_value?: string;
  dismissed?: boolean;
}

export interface ContinuityCheck {
  id: string;
  series_id: string;
  input_text: string | null;
  flags: ContinuityFlag[];
  confirmed_count: number;
  contradiction_count: number;
  checked_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  status: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueryResult {
  answer: string;
  sources: Array<{
    book_number: number;
    chapter_number: number;
    excerpt: string;
  }>;
}

export interface ProcessingStatus {
  book_id: string;
  status: Book['processing_status'];
  character_count: number;
  location_count: number;
  event_count: number;
  chapter_count: number;
}
