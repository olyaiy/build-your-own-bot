'use client'

import { Section, ToolArgsSection } from '@/components/agent/section'
import { SearchResults } from '@/components/agent/search-results'
import { SearchResultsType } from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { DefaultSkeleton } from '@/components/util/default-skeleton'
import { CollapsibleMessage } from '@/components/chat/collapsible-message'

interface RetrieveSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RetrieveSection({
  tool,
  isOpen,
  onOpenChange
}: RetrieveSectionProps) {
  const isLoading = tool.state === 'call'
  const data: SearchResultsType =
    tool.state === 'result' ? tool.result : undefined
  const url = tool.args.url as string | undefined

  const header = <ToolArgsSection tool="retrieveTool">{url}</ToolArgsSection>

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {!isLoading && data ? (
        <Section title="Sources">
          <SearchResults results={data.results} />
        </Section>
      ) : (
        <DefaultSkeleton />
      )}
    </CollapsibleMessage>
  )
}

export default RetrieveSection
