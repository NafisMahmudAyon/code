import { XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from 'aspect-ui/Input';
import React, { useState, KeyboardEvent, ChangeEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags();
    }
  };

  const addTags = () => {
    const newTags = input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '' && !tags.includes(tag));

    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={addTags}
          placeholder="Enter tags (comma-separated)..."
          icon={false}
          label='Tags'
          className="pl-4 pr-10"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 p-1 hover:bg-blue-200 rounded-full"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}