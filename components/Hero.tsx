import React from 'react';
import { Code2, Search, Users, Star } from 'lucide-react';
import { NumberCounter } from 'aspect-ui/NumberCounter';
import { Typography } from 'aspect-ui/Typography';

export function Hero() {
  return (
    <div className="relative overflow-hidden  flex items-center justify-center py-20 min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjc1IDExTDI2IDE2LjI1TDIwLjc1IDIxLjVNMTAuMjUgMjEuNUw1IDE2LjI1TDEwLjI1IDExTTE3Ljc1IDhMMTMuMjUgMjQuNSIgc3Ryb2tlPSIjMTgxODE2IiBzdHJva2Utb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjc1IDExTDI2IDE2LjI1TDIwLjc1IDIxLjVNMTAuMjUgMjEuNUw1IDE2LjI1TDEwLjI1IDExTTE3Ljc1IDhMMTMuMjUgMjQuNSIgc3Ryb2tlPSIjREREREREIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] opacity-40" style={{ maskImage: 'linear-gradient(to top, transparent, black)' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-500/10 p-3 rounded-2xl">
              <Code2 className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <Typography tagName="h1" className="text-4xl md:text-6xl font-bold text-primary-900 mb-6">
            Share Code Snippets with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600"> Developers</span>
          </Typography>
          <Typography variant="body1" className="text-xl max-w-3xl mx-auto mb-10">
            Discover, share, and learn from code snippets shared by developers worldwide.
            Find solutions, share your knowledge, and collaborate with the community.
          </Typography>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Browse Snippets
            </button>
            <button className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Code2 className="w-5 h-5" />
              Share Your Code
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Code2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold flex items-center justify-center text-white"><NumberCounter end={2000} duration={2000} />+</div>
              
              <div className="text-primary-600 dark:text-primary-100">Code Snippets</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold flex items-center justify-center text-white"><NumberCounter end={15000} duration={2000} />+</div>
              <div className="text-primary-600 dark:text-primary-100">Developers</div>
            </div>
            <div className="text-center md:col-span-1 col-span-2">
              <div className="flex justify-center mb-2">
                <Star className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold flex items-center justify-center text-white"><NumberCounter end={50000} duration={2000} />+</div>
              <div className="text-primary-600 dark:text-primary-100">Code Saves</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}