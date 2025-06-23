export interface SentimentEntry {
  id: string;
  contributor_name: string | null;
  sentiment_text: string;
  created_at: string;
  user_ip_hash: string;
  isOptimistic?: boolean;
}

export interface SentimentPayload {
  new: SentimentEntry | null;
  old: SentimentEntry | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface WordCloudData {
  size?: number;
  text: string;
  value: number;
}

export interface CloudWord extends WordCloudData {
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
  fontWeight?: string;
}

export interface CommunityInsights {
  id: string;
  project_name: string;
  total_words: number;
  unique_contributors: number;
  total_submissions: number;
  avg_words_per_submission: number;
  first_submission: string;
  created_at: string;
}
