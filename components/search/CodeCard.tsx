import React from 'react';
import { ThumbsUp, Calendar } from 'lucide-react';

interface CodeCardProps {
  snippet: CodeSnippet;
}

export function CodeCard({ snippet }: CodeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {snippet.title}
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            {snippet.language}
          </span>
        </div>
        
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {snippet.description}
        </p>

        <pre className="mt-3 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
          <code>{snippet.code.slice(0, 150)}...</code>
        </pre>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-sm">{snippet.vote_count}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {new Date(snippet.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <img
              src={snippet.author.avatar_url}
              alt={snippet.author.name}
              className="h-6 w-6 rounded-full"
            />
            <span className="ml-2 text-sm text-gray-700">
              {snippet.author.name}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}