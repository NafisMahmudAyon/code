'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { SearchFilters } from './SearchResults';
import SearchResults from './SearchResults';
import SnippetTabs from './SnippetTabs';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    console.log(searchQuery)
    const lang = searchParams.get('lang');

    setQuery(searchQuery || '');
    setLanguage(lang);
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Search Bar */}
      <SearchBar query={query} setQuery={setQuery} />

      {/* Show Tabs if No Search Query */}
      {!query && <SnippetTabs setLanguage={setLanguage} />}

      {/* Search Filters */}
      <SearchFilters />

      {/* Search Results */}
      <SearchResults query={query} language={language} />
    </div>
  );
}
