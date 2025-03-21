'use client'

import type { SearchResults } from '@/lib/types'
import { ToolInvocation } from 'ai'
import { CollapsibleMessage } from '../chat/collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { Section, ToolArgsSection } from '../agent/section'
import { useEffect } from 'react'
import { ImageResults } from './image-results'

interface ImageSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  state?: string
}

export function ImageSection({
  tool,
  isOpen,
  onOpenChange,
  state
}: ImageSectionProps) {
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }
  
  useEffect(() => {
  }, [isOpen])
  
  const imageResults: SearchResults =
    (state === 'result') ? 
    ('result' in tool ? tool.result : undefined) : undefined
    
  const query = tool.args?.query as string | undefined
  const country = tool.args?.country as string | undefined
  const countryText = country ? ` [${country}]` : ''

  const header = (
    <ToolArgsSection
      tool="image"
      number={imageResults?.results?.length}
      state={state}
    >{`${query}${countryText}`}</ToolArgsSection>
  )

  // Filter for image type results
  const imageItems = imageResults?.results?.filter(
    item => 'type' in item && item.type === 'image'
  ) || []

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
        <Section title="Images">
          <ImageResults 
            results={imageItems} 
            images={imageResults?.images || []}
            query={query}
          />
        </Section>
      )}
    </CollapsibleMessage>
  )
} 