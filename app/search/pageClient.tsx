'use client';

import { CodeCard } from '@/components/search/CodeCard';
import { LanguageTabs } from '@/components/search/LanguageTabs';
import { SearchBar } from '@/components/search/SearchBar';
import { SortSelect } from '@/components/search/SortSelect';
import { searchSnippets } from '@/components/search/supabase';
import { TagFilter } from '@/components/search/TagFilter';
import { CodeSnippet } from '@/components/search/Types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('newest');
  const [results, setResults] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load latest snippets on initial page load
  useEffect(() => {
    performSearch('', [], 'newest', '');
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery, selectedTags, sortBy, selectedLanguage);
    }
  }, [searchParams, selectedTags, sortBy, selectedLanguage]);

  const performSearch = async (searchQuery: string, tags: string[], sort: 'votes' | 'newest', lang: string) => {
    setLoading(true);
    try {
      const response = await searchSnippets({
        q: searchQuery,
        tags: tags,
        sort: sort,
        lang: lang,
        page: 1
      });
      setResults(response.snippets);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    router.push(`/search?${params.toString()}`);
  };

  const handleToggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    performSearch(query, newTags, sortBy, selectedLanguage);
  };

  const handleSortChange = (value: 'votes' | 'newest') => {
    setSortBy(value);
    performSearch(query, selectedTags, value, selectedLanguage);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    performSearch(query, selectedTags, sortBy, language);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <SearchBar value={query} onChange={handleSearch} />

        <div className="flex justify-between items-start">
          <div className="w-64 space-y-6">
            <LanguageTabs
              selected={selectedLanguage}
              onChange={handleLanguageChange}
            />
            <TagFilter
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />
          </div>

          <div className="flex-1 ml-6">
            <div className="flex justify-end mb-4">
              <SortSelect value={sortBy} onChange={handleSortChange} />
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : (
                <>
                  {query ? (
                    <p className="text-gray-600 mb-4">
                      Showing results for: {query}
                    </p>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      Latest code snippets
                    </p>
                  )}
                  {results.length > 0 ? (
                    results.map((snippet) => (
                      <CodeCard key={snippet.id} snippet={snippet} />
                    ))
                  ) : query ? (
                    <p className="text-gray-600">No results found</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}