'use client'


import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { ToolInvocation } from 'ai'
import { CollapsibleMessage } from '../chat/collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { SearchResults } from './search-results'
import { SearchResultsImageSection } from './search-results-image'
import { Section, ToolArgsSection } from '../agent/section'
import { useEffect } from 'react'


interface SearchSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  state?: string
}

export function SearchSection({
  tool,
  isOpen,
  onOpenChange,
  state
}: SearchSectionProps) {
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }
  
  useEffect(() => {
  }, [isOpen])


  
  const isToolLoading = state === 'call' || tool.state === 'call'
  const searchResults: TypeSearchResults =
    (state === 'result' || tool.state === 'result') ? 
    ('result' in tool ? tool.result : undefined) : undefined
  const query = tool.args?.query as string | undefined
  const includeDomains = tool.args?.includeDomains as string[] | undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  const header = (
    <ToolArgsSection
      tool="search"
      number={searchResults?.results?.length}
      state={state}
    >{`${query}${includeDomainsString}`}</ToolArgsSection>
  )


  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      {searchResults &&
        searchResults.images &&
        searchResults.images.length > 0 && (
          <Section>
            {/* Search Result Images */}
            <SearchResultsImageSection
              images={searchResults.images}
              query={query}
            />
          </Section>
        )}
      {state !== 'result' ? (
        <SearchSkeleton />
      ) : searchResults?.results ? (
        <Section title="Sources">
          <SearchResults results={searchResults.results} />
        </Section>
      ) : null}
    </CollapsibleMessage>
  )
}
