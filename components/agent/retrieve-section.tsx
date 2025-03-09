'use client'

import { Section, ToolArgsSection } from '../agent/section'
import { SearchResults } from '../search/search-results'
import { SearchResultsType } from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { DefaultSkeleton } from '../util/default-skeleton'
import { CollapsibleMessage } from '../chat/collapsible-message'

interface RetrieveSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  state?: string
}

export function RetrieveSection({
  tool,
  isOpen,
  onOpenChange,
  state
}: RetrieveSectionProps) {
  const isLoading = tool.state === 'call' || state === 'loading'
  const data: SearchResultsType =
    tool.state === 'result' ? tool.result : undefined
  const url = tool.args?.url as string | undefined

  const header = <ToolArgsSection tool="retrieveTool" state={state}>{url}</ToolArgsSection>

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="w-full max-w-full overflow-hidden">
        {!isLoading && data ? (
          <Section title="Sources" className="w-full max-w-full overflow-hidden">
            <div className="w-full max-w-full overflow-hidden">
              <SearchResults results={data.results} />
            </div>
          </Section>
        ) : (
          <DefaultSkeleton />
        )}
      </div>
    </CollapsibleMessage>
  )
}

export default RetrieveSection
