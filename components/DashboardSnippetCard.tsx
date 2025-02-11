'use client'
import { SnippetsWithVotes, useCode } from '@/context/codeContext';
import { Typography } from 'aspect-ui/Typography';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import formatDate from './dateFormat';
// import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Bookmark, Comments, Link as LinkIcon, Votes } from './Icons';
import Link from 'next/link';

const DashboardSnippetCard = ({ snippets }: { snippets: SnippetsWithVotes }) => {
  const [copied, setCopied] = useState(false);
  // const [isBookmarked, setIsBookmarked] = useState(isFavorited);

  const { upVote } = useCode()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets.code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-primary-200/30 dark:bg-primary-950/30 rounded-xl p-6 max-w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography tagName='h3' variant="h3" className="text-primary-900 select-none">{snippets.title}</Typography>
          <Typography className="text-sm text-gray-500 mt-1 select-none">
            {formatDate(snippets.created_at ?? new Date().toISOString(), "MMM DD, YYYY")}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {/* <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isBookmarked ? 'text-indigo-500' : 'text-gray-500'
              }`}
            title="Bookmark snippet"
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button> */}
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-1.5 right-3 text-xs font-medium text-primary-200 uppercase">
          {snippets.language}
        </div>
        <div className="rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={snippets.language.toLowerCase()}
            style={coldarkDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.5rem',
              lineHeight: '1.5',
              borderRadius: '0.5rem',
              maxWidth: "100%",
              height: "200px",
              overflow: "hidden",
              userSelect: "none"
            }}
          >
            {snippets.code ?? ""}{""}
          </SyntaxHighlighter>
        </div>
      </div>
      <div className='mt-3  flex justify-between items-center'>
        <div className='inline-flex bg-primary-200/70 dark:bg-primary-950/50 rounded-lg'>
          <span className={`p-1 inline-flex hover:text-emerald-400 hover:bg-emerald-600 rounded-lg ${snippets.upvote && 'text-emerald-400 bg-emerald-600'}`} onClick={()=>{upVote(snippets.id)}}><Votes/><span className='mr-3 select-none'>{snippets.upvotes}</span></span>

          <span className={`p-1 hover:bg-red-400 rounded-lg hover:text-red-300 ${snippets.downvote && 'text-red-400 bg-red-600'}`} onClick={()=>{upVote(snippets.id,true)}}><Votes className='rotate-180' /></span>
        </div>
        <div className='inline-flex items-center group'>
          <span className='p-1 '><Link href={`/code/${snippets.slug}`}> <Comments className='group-hover:bg-cyan-600 rounded-lg group-hover:text-cyan-300 transition-colors duration-150' /></Link>
          </span>
          <span className='ml-1 group-hover:text-cyan-600 transition-colors duration-150 select-none'>10</span>
        </div>
        <div className='inline-flex items-center group'>
          <span className='p-1 '><Bookmark className='group-hover:bg-amber-600 rounded-lg group-hover:text-amber-300 transition-colors duration-150' />
          </span>
        </div>
        <div className='inline-flex items-center group'>
          <span className='p-1 '><LinkIcon className='group-hover:bg-sky-600 rounded-lg group-hover:text-sky-300 transition-colors duration-150' />
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashboardSnippetCard