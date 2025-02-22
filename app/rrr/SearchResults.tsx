import { useEffect, useState } from 'react';
import { supabase } from '@/hooks/supabaseClient';
import { useCode } from '@/context/codeContext';

type Snippet = {
  id: string;
  title: string;
  description: string;
  content: string;
  upvotes: number;
  downvotes: number;
  language: string;
  created_at: string;
  tags?: string[];
};

type SortOption = 'most-upvoted' | 'newest' | 'most-viewed';
type DateFilter = 'all' | '7days' | '30days';

type SearchFiltersProps = {
  onFiltersChange: (filters: {
    sortBy: SortOption;
    dateFilter: DateFilter;
    tagFilter: string;
  }) => void;
};

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [sortBy, setSortBy] = useState<SortOption>('most-upvoted');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [tagFilter, setTagFilter] = useState('');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOption;
    setSortBy(value);
    onFiltersChange({ sortBy: value, dateFilter, tagFilter });
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DateFilter;
    setDateFilter(value);
    onFiltersChange({ sortBy, dateFilter: value, tagFilter });
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagFilter(e.target.value);
    onFiltersChange({ sortBy, dateFilter, tagFilter: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 my-4">
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="border rounded-lg px-4 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="most-upvoted">Sort by: Most Upvoted</option>
        <option value="newest">Newest First</option>
        <option value="most-viewed">Most Viewed</option>
      </select>

      <select
        value={dateFilter}
        onChange={handleDateFilterChange}
        className="border rounded-lg px-4 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Filter by Date</option>
        <option value="7days">Last 7 days</option>
        <option value="30days">Last 30 days</option>
      </select>

      <input
        type="text"
        value={tagFilter}
        onChange={handleTagFilterChange}
        placeholder="Filter by Tag"
        className="border rounded-lg px-4 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

type SearchResultsProps = {
  query: string;
  language: string | null;
};

export default function SearchResults({ query: searchQuery, language }: SearchResultsProps) {
  console.log(searchQuery)
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const {profile} = useCode()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sortBy: 'most-upvoted' as SortOption,
    dateFilter: 'all' as DateFilter,
    tagFilter: '',
  });

  useEffect(() => {
    async function fetchSnippets() {
      setLoading(true);
      setError(null);

      try {
        // Get snippets with votes count
        const snippetsQuery = supabase
          .from('code_code_snippets')
          .select(`
            id, title, description, code, language, created_at, tags,
            code_votes!left(snippet_id, vote)
          `)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        // Apply filters
        if (language) {
          snippetsQuery.match({ language });
        }

        if (filters.dateFilter !== 'all') {
          const daysAgo = filters.dateFilter === '7days' ? 7 : 30;
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          snippetsQuery.gte('created_at', date.toISOString());
        }

        if (filters.tagFilter) {
          snippetsQuery.contains('tags', [filters.tagFilter]);
        }

        // Get user votes if profile exists
        const [snippetsResponse, userVotesResponse] = await Promise.all([
          snippetsQuery.limit(10),
          profile
            ? supabase
              .from('code_votes')
              .select('snippet_id, vote')
              .eq('user_id', profile.id)
            : { data: [], error: null },
        ]);

        if (snippetsResponse.error) throw snippetsResponse.error;
        if (userVotesResponse.error) throw userVotesResponse.error;

        // Process snippets with vote information
        const processedSnippets = snippetsResponse.data.map(snippet => {
          const upvotes = snippet.code_votes?.filter(v => v.vote === 1).length || 0;
          const downvotes = snippet.code_votes?.filter(v => v.vote === -1).length || 0;

          const userVote = profile
            ? userVotesResponse.data?.find(v => v.snippet_id === snippet.id)
            : null;

          return {
            ...snippet,
            upvotes,
            downvotes,
            upvote: profile ? userVote?.vote === 1 : false,
            downvote: profile ? userVote?.vote === -1 : false,
          };
        });

        // Sort snippets
        const sortedSnippets = [...processedSnippets].sort((a, b) => {
          switch (filters.sortBy) {
            case 'most-upvoted':
              return b.upvotes - a.upvotes;
            case 'newest':
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'most-viewed':
              return b.upvotes - a.upvotes;
            default:
              return 0;
          }
        });

        setSnippets(sortedSnippets);
      } catch (error) {
        console.error('Error fetching snippets:', error);
        setError('Failed to fetch snippets');
      }

      setLoading(false);
    }

    if (searchQuery.trim() !== '') {
      fetchSnippets();
    }
  }, [searchQuery, language, filters, profile]);

  return (
    <div>
      <SearchFilters onFiltersChange={setFilters} />

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 py-4">{error}</p>
      ) : snippets.length > 0 ? (
        <div className="space-y-4">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg">{snippet.title}</h3>
              <p className="text-gray-600 mt-2">{snippet.description}</p>
              <pre className="bg-gray-900 text-white p-4 rounded mt-4 overflow-x-auto">
                {snippet.content}
              </pre>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className={snippet.upvote ? "text-blue-500" : ""}>
                    👍 {snippet.upvotes}
                  </span>
                  <span className={snippet.downvote ? "text-blue-500" : ""}>
                    👎 {snippet.downvotes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {snippet.tags?.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No results found.</p>
      )}
    </div>
  );
}