'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CodeCard } from '../../components/search/CodeCard';
import { LanguageTabs } from '../../components/search/LanguageTabs';
import { SearchBar } from '../../components/search/SearchBar';
import { SortSelect } from '../../components/search/SortSelect';
import { searchSnippets } from '../../components/search/supabase';
import { TagFilter } from '../../components/search/TagFilter';
import type { CodeSnippet, SearchParams } from '../../components/search/Types';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentParams: SearchParams = {
    q: searchParams.get('q') || '',
    lang: searchParams.get('lang') || '',
    sort: (searchParams.get('sort') as 'votes' | 'newest') || 'newest',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    page: Number(searchParams.get('page')) || 1,
  };

  useEffect(() => {
    async function fetchInitialSnippets() {
      setLoading(true);
      try {
        const response = await searchSnippets({ ...currentParams, page: 1 });
        setSnippets(response.snippets);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('Error fetching snippets:', error);
      }
      setLoading(false);
    }
    fetchInitialSnippets();
  }, [currentParams.q, currentParams.lang, currentParams.sort, currentParams.tags.join(',')]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = currentParams.page + 1;
      const response = await searchSnippets({ ...currentParams, page: nextPage });
      setSnippets((prev) => [...prev, ...response.snippets]);
      setHasMore(response.hasMore);

      updateSearch({ page: nextPage });
    } catch (error) {
      console.error('Error loading more snippets:', error);
    }
    setLoadingMore(false);
  };

  const updateSearch = (updates: Partial<SearchParams>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.length > 0) {
        if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, String(value));
        }
      } else {
        newParams.delete(key);
      }
    });

    if (!('page' in updates)) {
      newParams.delete('page');
    }

    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <SearchBar
            value={currentParams.q}
            onChange={(q) => updateSearch({ q })}
          />

          <div className="flex items-center justify-between">
            <LanguageTabs
              selected={currentParams.lang}
              onChange={(lang) => updateSearch({ lang })}
            />

            <SortSelect
              value={currentParams.sort}
              onChange={(sort) => updateSearch({ sort })}
            />
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <TagFilter
                selectedTags={currentParams.tags}
                onToggleTag={(tag) => {
                  const tags = currentParams.tags.includes(tag)
                    ? currentParams.tags.filter((t) => t !== tag)
                    : [...currentParams.tags, tag];
                  updateSearch({ tags });
                }}
              />
            </div>

            <div className="col-span-9">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                </div>
              ) : snippets.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {snippets.map((snippet) => (
                      <CodeCard key={`${snippet.id}-${snippet.updated_at}`} snippet={snippet} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Loading...
                          </span>
                        ) : (
                          'Load More'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No snippets found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;