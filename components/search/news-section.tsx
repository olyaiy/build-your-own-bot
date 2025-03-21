'use client'

import type { SearchResults } from '@/lib/types'
import { ToolInvocation } from 'ai'
import { CollapsibleMessage } from '../chat/collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { Section, ToolArgsSection } from '../agent/section'
import { NewsResults, NewsResultItem } from './news-results'
import { useEffect } from 'react'

interface NewsSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  state?: string
}

export function NewsSection({
  tool,
  isOpen,
  onOpenChange,
  state
}: NewsSectionProps) {
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }
  
  useEffect(() => {
  }, [isOpen])
  
  const newsResults: SearchResults =
    (state === 'result') ? 
    ('result' in tool ? tool.result : undefined) : undefined
    
  const query = tool.args?.query as string | undefined
  const country = tool.args?.country as string | undefined
  const countryText = country && country !== 'ALL' ? ` [${country}]` : ''

  const header = (
    <ToolArgsSection
      tool="news"
      number={newsResults?.results?.length}
      state={state}
    >{`${query}${countryText}`}</ToolArgsSection>
  )

  // Filter for news type results
  const newsItems = newsResults?.results?.filter(
    item => 'type' in item && item.type === 'news'
  ) as NewsResultItem[] || []

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      {state !== 'result' ? (
        <SearchSkeleton />
      ) : (
        <Section title="News">
          <NewsResults results={newsItems} />
        </Section>
      )}
    </CollapsibleMessage>
  )
} 