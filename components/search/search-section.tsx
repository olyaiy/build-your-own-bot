// SearchSection.tsx (with comments)

'use client'
// This directive marks the component as a Client Component in Next.js,
// meaning it will be rendered on the client side with full React interactivity

import type { SearchResultItem} from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { useChat } from 'ai/react'
import { CollapsibleMessage } from '../chat/collapsible-message'
import { SearchSkeleton } from '../util/default-skeleton'
import { SearchResults } from './search-results'
import { SearchResultImage, SearchResultsImageSection } from './search-results-image'
import { Section, ToolArgsSection } from '../agent/section'

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
  isOpen: boolean                 // Whether the collapsible section is open
  onOpenChange: (open: boolean) => void  // Callback to handle open/close state changes
}

export function SearchSection({
  tool,
  isOpen,
  onOpenChange
}: SearchSectionProps) {
  // Use the chat hook to access loading state for the search operation
  const { isLoading } = useChat({
    id: CHAT_ID
  })

  
  
  // Determine if the tool is currently loading (in 'call' state)
  const isToolLoading = tool.state === 'call'
  
  // Extract search results if the tool has completed (in 'result' state)
  const searchResults: SearchResults =
    tool.state === 'result' ? tool.result : undefined
    
  // Extract the search query from tool arguments
  const query = tool.args?.query as string | undefined
  
  // Extract any domain filters from tool arguments
  const includeDomains = tool.args?.includeDomains as string[] | undefined
  
  // Format domain filters as a string for display
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  // Create the header component that shows the query and domain filters
  const header = (
    <ToolArgsSection
      tool="search"
      number={searchResults?.results?.length}
    >{`${query}${includeDomainsString}`}</ToolArgsSection>
  )

  // console.log('INSIDE SEARCH SECTIONSEARCH RESULTS:', searchResults)
  console.log('IS TOOL LOADING FROM INSIDE SEARCH SECTION:', isToolLoading)


  // Render the collapsible message container with search results
  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      // isOpen={isOpen}
      // onOpenChange={onOpenChange}
    >
      {/* Render image results section if images exist */}
      {searchResults &&
        searchResults.images &&
        searchResults.images.length > 0 && (
          <Section>
            <SearchResultsImageSection
              images={searchResults.images}
              query={query}
            />
          </Section>
        )}
      
      {/* Show loading skeleton if search is in progress, otherwise show results */}
      {isLoading && isToolLoading ? (
        <SearchSkeleton />
      ) : searchResults?.results ? (
        <Section title="Sources">
          <SearchResults results={searchResults.results} />
        </Section>
      ) : null}
    </CollapsibleMessage>
  )
}