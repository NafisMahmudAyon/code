import { useRouter } from 'next/navigation';
import { useState } from 'react';

const languages = ['All', 'JavaScript', 'Python', 'C++', 'Rust', 'Go', 'TypeScript'];

export default function SnippetTabs({ setLanguage }: { setLanguage: (lang: string | null) => void }) {
  const [activeTab, setActiveTab] = useState('All');
  const router = useRouter();

  const handleTabClick = (lang: string) => {
    setActiveTab(lang);
    setLanguage(lang === 'All' ? null : lang);
    router.push(`/search?lang=${encodeURIComponent(lang)}`);
  };

  return (
    <div className="flex space-x-4 overflow-x-auto py-4">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleTabClick(lang)}
          className={`px-4 py-2 rounded-lg ${activeTab === lang ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
