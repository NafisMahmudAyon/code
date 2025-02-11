'use client'
import { CodeEditor } from '@/components/CodeEditor'
import { TagInput } from '@/components/TagInput'
import { useCode } from '@/context/codeContext'
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { Button } from 'aspect-ui/Button'
import { Input } from 'aspect-ui/Input'
import { Textarea } from 'aspect-ui/Textarea'
import { useState } from 'react'


const Page = () => {
  const { profile, handleCreateSnippet, snippet, setSnippet } = useCode()
  const [copied, setCopied] = useState(false);
  if (!profile) {
    return
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='w-screen h-screen bg-primary-200 grid grid-cols-4'>
      <div className='col-span-1 border-r border-r-primary-950/20 shadow inset-shadow-primary-950 px-4 py-8'>
        <Input value={snippet.title} icon={false} label='Title' placeholder='Title' onChange={(e) => setSnippet({ ...snippet, title: e.target.value })} className='pl-4 pr-10' />
        <Textarea value={snippet.description} label='Description' placeholder='Description' onChange={(e) => setSnippet({ ...snippet, description: e.target.value })} />
        {/* Tags like react select comma separated values when comma then make a tag  */}
        <TagInput tags={snippet.tags} onChange={(tags) => setSnippet({ ...snippet, tags })} />


        <pre className='text-primary-900 text-body2'>{JSON.stringify(snippet)}</pre>
        <Button onClick={() => { handleCreateSnippet() }}>Create Snippet</Button>
      </div>
      <div className='col-span-3 flex flex-col'>
        <div className='flex w-full border-b border-b-primary-950/20 shadow inset-shadow-primary-950 py-3 px-4'>JavaScript</div>
        <div className='h-full flex flex-col items-center justify-center'>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg w-[90%]">
            <div className="flex items-center space-x-2">
              <span className='flex items-center space-x-2 mr-5'>
                <span className="size-3 rounded-full bg-amber-500"></span><span className="size-3 rounded-full bg-amber-500"></span><span className="size-3 rounded-full bg-amber-500"></span>
              </span>
              <CodeBracketIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {snippet.language} Editor
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm text-gray-600">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
          {/* <CodeBlock
            language="jsx"
            filename="DummyComponent.jsx"
            highlightLines={[9, 13, 14, 18]}
            code={snippet.code}
          /> */}
          <CodeEditor update={(code: string | undefined) => setSnippet({ ...snippet, code })}
          />
        </div>
      </div>


    </div>
  )
}

export default Page