import React from 'react';

interface SortSelectProps {
  value: string;
  onChange: (value: 'votes' | 'newest') => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'votes' | 'newest')}
      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
    >
      <option value="newest">Newest First</option>
      <option value="votes">Most Voted</option>
    </select>
  );
}