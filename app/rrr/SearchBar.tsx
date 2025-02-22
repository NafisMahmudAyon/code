import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = {
  query: string;
  setQuery: (query: string) => void;
};

export default function SearchBar({ query, setQuery }: SearchBarProps) {
  const [input, setInput] = useState(query);
  useEffect(() => {
    setInput(query);
  }, [query]);
  const router = useRouter();

  const handleSearch = () => {
    router.push(`/search?q=${encodeURIComponent(input)}`);
  };

  return (
    <div className="flex items-center gap-2 border rounded-lg p-3 shadow-sm bg-white">
      <Search className="w-5 h-5 text-gray-500" />
      <input
        type="text"
        className="flex-1 bg-transparent outline-none"
        placeholder="Search snippets..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      {input && (
        <button
          onClick={() => {
            setInput('');
            setQuery('');
            router.push('/search');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
      )}
    </div>
  );
}
