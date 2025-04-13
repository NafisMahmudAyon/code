'use client'
import { SnippetsWithVotes } from "@/context/codeContext";
import { Typography } from "aspect-ui";
import { memo, useCallback, useState } from "react";
import formatDate from "./dateFormat";
import { Check, Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bookmark, Comments, Link as LinkIcon, Votes } from "@/components/Icons";
import Link from "next/link";


export const DashboardSnippetCard = memo(function DashboardSnippetCard({ snippets, upVote }: { snippets: SnippetsWithVotes, upVote: (id: number | undefined, downVote?: boolean) => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  console.log(snippets)
  console.log("snippets")

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippets.code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [snippets.code]);

  // const syntaxHighlighterStyle = useMemo(() => ({
  //   margin: 0,
  //   padding: '1.5rem',
  //   fontSize: '0.5rem',
  //   lineHeight: '1.5',
  //   borderRadius: '0.5rem',
  //   maxWidth: "100%",
  //   height: "200px",
  //   overflow: "hidden",
  //   userSelect: "none"
  // }), []);

  return (
    <div className="bg-primary-200/30 dark:bg-primary-950/30 rounded-xl p-6 max-w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography tagName='h3' variant="h3" className="text-primary-900 select-none">
            {snippets.title}
          </Typography>
          <Typography className="text-sm text-gray-500 mt-1 select-none">
            {formatDate(snippets.created_at ?? new Date().toISOString(), "MMM DD, YYYY")}
          </Typography>
        </div>
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
      </div>

      <div className="relative">
        <div className="absolute top-1.5 right-3 text-xs font-medium text-primary-200 uppercase select-none">
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
            {snippets.code ?? ""}
          </SyntaxHighlighter>
        </div>
      </div>

      <ActionButtons snippets={snippets} upVote={upVote} />
    </div>
  );
});

// Action Buttons Component

const ActionButtons = memo(function ActionButtons({ snippets, upVote }: {
  snippets: SnippetsWithVotes;
  upVote: (id: number, downVote?: boolean) => Promise<void>;
}) {
  return (
    <div className='mt-3 flex justify-between items-center'>
      <VoteButtons snippets={snippets} upVote={upVote} />
      <CommentsButton slug={snippets.slug} />
      <BookmarkButton />
      <ShareButton />
    </div>
  )
});

const BookmarkButton = memo(function BookmarkButton() {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><Bookmark className='group-hover:bg-amber-600 rounded-lg group-hover:text-amber-300 transition-colors duration-150' />
      </span>
    </div>
  )
})

const ShareButton = memo(function ShareButton() {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><LinkIcon className='group-hover:bg-sky-600 rounded-lg group-hover:text-sky-300 transition-colors duration-150' />
      </span>
    </div>
  )
})

const CommentsButton = memo(function CommentsButton({ slug }: { slug: string | undefined }) {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><Link href={`/code/${slug}`}> <Comments className='group-hover:bg-cyan-600 rounded-lg group-hover:text-cyan-300 transition-colors duration-150' /></Link>
      </span>
      <span className='ml-1 group-hover:text-cyan-600 transition-colors duration-150 select-none'>10</span>
    </div>
  )
})

const VoteButtons = memo(function VoteButtons({ snippets, upVote }: {
  snippets: SnippetsWithVotes;
  upVote: (id: number, downVote?: boolean) => Promise<void>;
}) {
  return (
    <div className='inline-flex bg-primary-200/70 dark:bg-primary-950/50 rounded-lg'>
      <span className={`p-1 inline-flex hover:text-emerald-400 hover:bg-emerald-600 rounded-lg ${snippets.upvote && 'text-emerald-400 bg-emerald-600'}`} onClick={() => {
        if (snippets.id) {
          upVote(snippets.id)
        }
      }}><Votes /><span className='mr-3 select-none'>{snippets.upvotes}</span></span>

      <span className={`p-1 hover:bg-red-400 rounded-lg hover:text-red-300 ${snippets.downvote && 'text-red-400 bg-red-600'}`} onClick={() => {
        if (snippets.id) {
          upVote(snippets.id, true)
        }
      }}><Votes className='rotate-180' /></span>
    </div>
  )
})