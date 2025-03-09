import { cn } from '@/lib/utils'
import { ChevronDown, UserCircle2 } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { IconLogo } from '../util/icons'
import { useEffect } from 'react'

interface CollapsibleMessageProps {
  children: React.ReactNode
  role: 'user' | 'assistant'
  isCollapsible?: boolean
  isOpen?: boolean
  header?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  showBorder?: boolean
  showIcon?: boolean
}

export function CollapsibleMessage({
  children,
  role,
  isCollapsible = false,
  isOpen = true,
  header,
  onOpenChange,
  showBorder = true,
  showIcon = true
}: CollapsibleMessageProps) {
  
  useEffect(() => {
  }, [isOpen])

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    }
  }

  const content = <div className="py-2 flex-1">{children}</div>

  return (
    <div className="flex gap-3">
    
      {isCollapsible ? (
        <div
          className={cn(
            'flex-1 rounded-2xl p-4',
            showBorder && 'border border-border/50'
          )}
        >
          <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="w-full"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full group ">
              <div className="flex items-center justify-between w-full gap-2 ">
                {header && <div className="text-sm w-full ">{header}</div>}
                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
              <Separator className="my-4 border-border/50" />
              {content}
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
        <div className="flex-1 rounded-2xl px-4">{content}</div>
      )}
    </div>
  )
}
