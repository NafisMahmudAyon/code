'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Check, Copy } from 'lucide-react'
import { Typography } from 'aspect-ui/Typography'
import { Dropdown, DropdownAction, DropdownContent, DropdownItem, DropdownList } from 'aspect-ui/Dropdown'
import { SnippetsWithVotes, useCode } from '@/context/codeContext'
import { supabase } from '@/hooks/supabaseClient'
import { Bookmark, Votes, Link as LinkIcon, Comments as CommentsIcon } from './Icons'
import formatDate from './dateFormat'
import Comments from './Comments'

// Types
interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  image: string
  publicMetadata: object
}

interface EditorSettings {
  fontSize: string
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: "14px"
}

const FONT_SIZE_OPTIONS = ['10px', '12px', '14px', '16px', '18px', '20px']

const CodeViewer = ({ slug }: { slug: string }) => {
  const router = useRouter()
  const { upVote } = useCode()

  // State
  const [user, setUser] = useState<User | null>(null)
  const [snippet, setSnippet] = useState<SnippetsWithVotes | null>(null)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<EditorSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS
    return JSON.parse(localStorage.getItem("editorSettings") ?? JSON.stringify(DEFAULT_SETTINGS))
  })

  // Memoized syntax highlighter styles
  const syntaxHighlighterStyles = useMemo(() => ({
    margin: 0,
    padding: '1.5rem',
    fontSize: settings.fontSize,
    lineHeight: '1.5',
    borderRadius: '0.5rem',
    maxWidth: "100%",
    minHeight: "400px",
    maxHeight: "600px",
  }), [settings.fontSize])

  // Handlers
  const updateFontSize = useCallback((newSize: string) => {
    const newSettings = { ...settings, fontSize: newSize }
    setSettings(newSettings)
    localStorage.setItem("editorSettings", JSON.stringify(newSettings))
  }, [settings])

  const handleCopy = useCallback(async () => {
    if (!snippet?.code) return

    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }, [snippet?.code])

  // Data fetching
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/getUser?userId=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error('Failed to fetch user')

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setUser(data)
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }, [])
  const fetchSnippetData = useCallback(async () => {
    try {
      // Fetch snippet details
      const { data: snippet, error: snippetError } = await supabase
        .from('code_code_snippets')
        .select('*')
        .eq('slug', slug)
        .single()

      if (snippetError) throw snippetError

      // Fetch user data
      const { data: userData, error: userDataError } = await supabase
        .from('code_profiles')
        .select('*')
        .eq('id', snippet.user_id)
        .single()

      if (userDataError) throw userDataError

      await fetchUserData(userData.user_id)

      // Fetch vote counts
      const { data: votesData, error: votesError } = await supabase
        .from('code_votes')
        .select('vote')
        .eq('snippet_id', snippet.id)

      if (votesError) throw votesError

      // Fetch comment count
      const { count: commentCount, error: commentError } = await supabase
        .from('code_comments')
        .select('id', { count: 'exact' })
        .eq('snippet_id', snippet.id)

      if (commentError) throw commentError

      const upvotes = votesData.filter(vote => vote.vote === 1).length
      const downvotes = votesData.filter(vote => vote.vote === -1).length

      setSnippet({ ...snippet, upvotes, downvotes, comment_count: commentCount })
    } catch (error) {
      console.error('Error fetching snippet data:', error)
    }
  }, [slug, fetchUserData])

  useEffect(() => {
    fetchSnippetData()
  }, [fetchSnippetData])

  if (!snippet) return null

  return (
    <div className='max-w-[1920px] min-w-full mx-auto'>
      <div className='max-w-[1024px] w-full mx-auto pt-16 relative'>
        <span className='cursor-pointer' onClick={() => router.back()}>Back</span>

        {/* Header Section */}
        <Typography tagName='h1' variant="h1">{snippet.title}</Typography>
        {snippet.description && (
          <Typography tagName='p' variant="body2">{snippet.description}</Typography>
        )}

        {/* Author Info */}
        <div className='flex items-center mb-8'>
          <Typography tagName='p' variant="body2">
            By {user?.firstName} {user?.lastName}
          </Typography>
          <span className='text-primary-200 mx-3'> • </span>
          <Typography tagName='p' variant="body2">
            {formatDate(snippet.created_at ?? new Date().toISOString(), "MMM DD, YYYY")}
          </Typography>
        </div>

        {/* Tags */}
        <div className='mb-4'>
          {snippet.tags.map((tag, i) => (
            <span key={i} className='text-primary-200 mx-3'>{tag}</span>
          ))}
        </div>

        {/* Code Display Section */}
        <div className="relative rounded-lg overflow-hidden bg-[#111b27] pt-9">
          {/* Code Header */}
          <div className='absolute top-2 left-0 w-full px-4 z-10 flex items-center justify-between border-b border-b-primary-100 bg-[#111b27] text-body2'>
            <div className='flex items-center gap-4'>
              <span className='inline-flex gap-1'>
                {[...Array(3)].map((_, i) => (
                  <span key={i} className='size-3 bg-primary-200 rounded-full inline-flex' />
                ))}
              </span>
              <p>{snippet.language}</p>
            </div>

            {/* Controls */}
            <div className='flex items-center gap-4'>
              <Dropdown hover>
                <DropdownAction className='bg-transparent dark:bg-transparent border border-transparent text-primary-200 hover:bg-transparent dark:hover:bg-transparent hover:border hover:border-primary-200 hover:text-primary-200'>
                  {settings.fontSize}
                </DropdownAction>
                <DropdownContent>
                  <DropdownList>
                    {FONT_SIZE_OPTIONS.map(size => (
                      <DropdownItem key={size} onClick={() => updateFontSize(size)}>
                        {size}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </DropdownContent>
              </Dropdown>

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
          </div>

          {/* Code Content */}
          <SyntaxHighlighter
            className='code-highlight light-scrollbar'
            language={snippet.language.toLowerCase()}
            style={coldarkDark}
            showLineNumbers={true}
            customStyle={syntaxHighlighterStyles}
            lineNumberStyle={{
              color: '#ccc',
              userSelect: "none"
            }}
          >
            {snippet.code ?? ""}
          </SyntaxHighlighter>
        </div>

        {/* Action Buttons */}
        <div className='mt-3 flex gap-4 items-center'>
          {/* Vote Controls */}
          <div className='inline-flex bg-primary-200/70 dark:bg-primary-950/50 rounded-lg'>
            <span
              className={`p-1 inline-flex hover:text-emerald-400 hover:bg-emerald-600 rounded-lg ${snippet.upvote && 'text-emerald-400 bg-emerald-600'
                }`}
              onClick={() => upVote(snippet.id)}
            >
              <Votes />
              <span className='mr-3 select-none'>{snippet.upvotes}</span>
            </span>

            <span
              className={`p-1 hover:bg-red-400 rounded-lg hover:text-red-300 ${snippet.downvote && 'text-red-400 bg-red-600'
                }`}
              onClick={() => upVote(snippet.id, true)}
            >
              <Votes className='rotate-180' />
            </span>
          </div>

          {/* Comments */}
          <div className='inline-flex items-center group'>
            <span className='p-1'>
              <Link href={`/code/${snippet.slug}#comments`}>
                <CommentsIcon className='group-hover:bg-cyan-600 rounded-lg group-hover:text-cyan-300 transition-colors duration-150' />
              </Link>
            </span>
            <span className='ml-1 group-hover:text-cyan-600 transition-colors duration-150 select-none'>
              {snippet.comment_count || 0}
            </span>
          </div>
          {/* Bookmark */}
          <div className='inline-flex items-center group'>
            <span className='p-1'>
              <Bookmark className='group-hover:bg-amber-600 rounded-lg group-hover:text-amber-300 transition-colors duration-150' />
            </span>
          </div>

          {/* Share Link */}
          <div className='inline-flex items-center group'>
            <span className='p-1'>
              <LinkIcon className='group-hover:bg-sky-600 rounded-lg group-hover:text-sky-300 transition-colors duration-150' />
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className='mt-8'>
          <Comments snippetSlug={slug} />
        </div>
      </div>
    </div>
  )
}

export default CodeViewer