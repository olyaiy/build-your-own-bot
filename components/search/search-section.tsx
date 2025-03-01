// SearchSection.tsx (with comments)

'use client'
// This directive marks the component as a Client Component in Next.js,
// meaning it will be rendered on the client side with full React interactivity

import type { SearchResultItem} from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { useChat } from 'ai/react'
import { SearchResults } from './search-results'
import { SearchResultImage } from './search-results-image'
import { ToolArgsSection } from '../agent/section'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Unique identifier for the chat context related to search functionality
export const CHAT_ID = 'search' as const

// Interface defining the structure of search results
export type SearchResults = {
  images: SearchResultImage[]      // Array of image results
  results: SearchResultItem[]      // Array of text/link results
  number_of_results?: number      // Optional count of total results
  query: string                    // The original search query
}

// Props interface for the SearchSection component
interface SearchSectionProps {
  tool: ToolInvocation            // The tool invocation object containing search state and results
  state: 'call' | 'partial-call'
}

export function SearchSection({
  tool,
  state
}: SearchSectionProps) {
  // Determine loading state based on the state prop
  // If state is 'partial-call', it's loading; if 'call', it's not loading
  const isLoading = state === 'partial-call'
  
  // Determine if the tool is currently loading (in 'call' state)
  const isToolLoading = tool.state === 'call'
  
  // Extract search results if the tool has completed (in 'result' state)
  const searchResults: SearchResults =
    tool.state === 'result' ? tool.result : undefined
    
  // Extract the search query from tool arguments
  const query = tool.args?.query as string | undefined

  console.log('THE STATE IS', state)
  console.log('THE TOOL INTERNAL STATE IS', searchResults)

  // Render the collapsible message container with search results
  return (
    <>

    {/* Search Term */}
    {tool?.args?.query && (
      <div className='bg-gray-900 p-4 rounded-md'>
        searched for {JSON.stringify(tool.args.query, null, 2)} 
      </div>
    )}

    {/* Search Results */}
    {searchResults?.results && (
      <div className='mt-4 gap-2 space-2 flex flex-col'>
        {searchResults.results.map((result, i) => (
          <div key={`result-${i}`} className='flex-1 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors'>
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className='block p-2 text-blue-400 hover:text-blue-300 transition-colors'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center justify-between'>
                <div className='font-medium'>{result.title}</div>
                <ExternalLinkIcon size={16} className="shrink-0" />
              </div>
              <div className='text-xs text-gray-400 truncate'>{result.url}</div>
            </a>
          </div>
        ))}
      </div>
    )}
    </>
  )
}