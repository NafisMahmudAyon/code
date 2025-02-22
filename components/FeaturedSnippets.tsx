'use client'

import { ArrowRight } from "lucide-react";
import { DashboardSnippetCard } from "@/app/dashboard/page";
import { useCode } from "@/context/codeContext";
import Link from "next/link";

export function FeaturedSnippets() {
  const { globalLatestSnippets, globalUpVote } = useCode();


  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Code Snippets</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of high-quality code snippets, curated by the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {globalLatestSnippets.map((snippet, index) => (
            <DashboardSnippetCard key={index} snippets={snippet} upVote={globalUpVote} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
          >
            Show More Snippets
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
