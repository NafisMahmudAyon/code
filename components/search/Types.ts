export interface CodeSnippet {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  language: string;
  tags: string[];
  code: string;
  slug: string;
  created_at: string;
  updated_at: string;
  vote_count?: number;
  author: {
    name: string;
    avatar_url: string;
  };
}

export interface SearchParams {
  q?: string;
  lang?: string;
  sort?: 'votes' | 'newest';
  tags?: string[];
  page?: number;
}

export interface SearchResponse {
  snippets: CodeSnippet[];
  total: number;
  hasMore: boolean;
}

export interface Votes {
  snippet_id: number;
  vote: number;
}