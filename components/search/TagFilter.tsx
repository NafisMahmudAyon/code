import React from 'react';
import { X } from 'lucide-react';

interface TagFilterProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export function TagFilter({ selectedTags, onToggleTag }: TagFilterProps) {
  const POPULAR_TAGS = ['react', 'node', 'api', 'database', 'algorithm', 'frontend', 'backend','test','new','javascript'];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm
              ${selectedTags.includes(tag)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tag}
            {selectedTags.includes(tag) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}