'use client'

import { Section, ToolArgsSection } from '../agent/section'
import { SearchResults } from '../search/search-results'
import { SearchResultsType } from '@/lib/ai/tools/retrieve'
import { ToolInvocation } from 'ai'
import { DefaultSkeleton } from '../util/default-skeleton'
import { CollapsibleMessage } from '../chat/collapsible-message'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  
  const [showFullContent, setShowFullContent] = useState(false)

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
              
              {data.results.length > 0 && data.results[0].content && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1 text-xs" 
                    size="sm"
                    onClick={() => setShowFullContent(!showFullContent)}
                  >
                    {showFullContent ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Hide full content
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Show full content
                      </>
                    )}
                  </Button>
                  
                  {showFullContent && (
                    <div className="mt-2 p-4 border rounded-md bg-muted/50 text-sm overflow-auto max-h-[500px]">
                      <pre className="whitespace-pre-wrap">{data.results[0].content}</pre>
                    </div>
                  )}
                </div>
              )}
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
