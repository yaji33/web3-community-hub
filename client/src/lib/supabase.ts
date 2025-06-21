import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for your database
export interface CommunitySentiment {
  id: string;
  contributor_name?: string | null;
  user_ip_hash?: string;
  project_name: string;
  sentiment_text: string;
  word_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityInsights {
  project_name: string;
  total_submissions: number;
  unique_contributors: number;
  total_words: number;
  avg_words_per_submission: number;
  first_submission: string;
  latest_submission: string;
}
