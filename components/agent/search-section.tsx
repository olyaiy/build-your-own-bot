'use client'

import { SearchResultsType } from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { useChat } from 'ai/react'
import { CollapsibleMessage } from '@/components/chat/collapsible-message'
import { DefaultSkeleton } from '@/components/util/default-skeleton'
import { SearchResults } from '@/components/agent/search-results'
import { Section, ToolArgsSection } from './section'

export const CHAT_ID = 'search' as const

interface SearchSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchSection({
  tool,
  isOpen,
  onOpenChange
}: SearchSectionProps) {
  const { isLoading } = useChat({
    id: CHAT_ID
  })
  const isToolLoading = tool.state === 'call'
  const searchResults: SearchResultsType =
    tool.state === 'result' ? tool.result : undefined
  const query = tool.args?.query as string | undefined
  const includeDomains = tool.args?.includeDomains as string[] | undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  const header = (
    <ToolArgsSection
      tool="searchTool"
      number={searchResults?.results?.length}
    >{`${query}${includeDomainsString}`}</ToolArgsSection>
  )

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {searchResults?.images && searchResults.images.length > 0 && (
        <Section title="Images">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {searchResults.images.map((image, index) => (
              <div key={index} className="aspect-video relative overflow-hidden rounded-md">
                <a 
                  href={typeof image === 'string' ? image : image.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <img 
                    src={typeof image === 'string' ? image : image.url}
                    alt={typeof image === 'string' ? query || 'Search result' : image.description || 'Search result'}
                    className="object-cover w-full h-full"
                  />
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}
      {isLoading || isToolLoading ? (
        <DefaultSkeleton />
      ) : searchResults?.results ? (
        <Section title="Sources">
          <SearchResults results={searchResults.results} />
        </Section>
      ) : null}
    </CollapsibleMessage>
  )
}

export default SearchSection
