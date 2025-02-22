import React from 'react';

const LANGUAGES = [
  'All',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'Go',
  'Rust',
];

interface LanguageTabsProps {
  selected: string;
  onChange: (language: string) => void;
}

export function LanguageTabs({ selected, onChange }: LanguageTabsProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang === 'All' ? '' : lang)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
            ${
              (lang === 'All' && !selected) || selected === lang
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}