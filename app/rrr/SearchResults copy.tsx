import { useEffect, useState } from 'react';
import { supabase } from '@/hooks/supabaseClient';

type Snippet = {
  id: string;
  title: string;
  description: string;
  content: string;
  upvotes: number;
  downvotes: number;
  language: string;
};

export default function SearchResults({ query, language }: { query: string; language: string | null }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSnippets() {
      setLoading(true);
      setError(null);

      let supabaseQuery = supabase
        .from('code_code_snippets')
        .select(
          `
          id, title, description, code, language, created_at,
          code_votes!left(snippet_id, vote)
        `
        );

      // Full-text search on title & description
      if (query.trim() !== '') {
        supabaseQuery = supabaseQuery.textSearch('title', query, { type: 'websearch' });
      }

      // Filter by language if provided
      if (language) {
        supabaseQuery = supabaseQuery.eq('language', language);
      }

      const { data, error } = await supabaseQuery.limit(10);

      if (error) {
        setError('Failed to fetch snippets');
        console.error('Error fetching snippets:', error);
      } else {
        // Compute upvotes and downvotes manually
        const processedSnippets = data.map((snippet) => ({
          ...snippet,
          upvotes: snippet.code_votes?.filter((v) => v.vote === 1).length || 0,
          downvotes: snippet.code_votes?.filter((v) => v.vote === -1).length || 0,
        }));
        setSnippets(processedSnippets);
      }

      setLoading(false);
    }

    fetchSnippets();
  }, [query, language]);

  return (
    <div>
      {loading ? (
        <p>Loading snippets...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : snippets.length > 0 ? (
        snippets.map((snippet) => (
          <div key={snippet.id} className="border p-4 rounded-lg shadow">
            <h3 className="font-bold">{snippet.title}</h3>
            <p className="text-gray-600">{snippet.description}</p>
            <pre className="bg-gray-900 text-white p-2 rounded">{snippet.content}</pre>
            <p className="text-sm text-gray-500">
              👍 {snippet.upvotes} | 👎 {snippet.downvotes}
            </p>
          </div>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}
