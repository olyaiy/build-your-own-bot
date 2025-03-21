import React from 'react'
import { Link, Loader2, Search, Video, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ToolBadgeProps = {
  tool: string
  children: React.ReactNode
  className?: string
}

export const ToolBadge: React.FC<ToolBadgeProps> = ({
  tool,
  children,
  className
}) => {
  const icon: Record<string, React.ReactNode> = {
    search: <Search size={14} />,
    search_loading: <Loader2 size={14} className="animate-spin" />,
    retrieve: <Link size={14} />,
    retrieve_loading: <Loader2 size={14} className="animate-spin" />,
    video_search: <Video size={14} />,
    video_search_loading: <Loader2 size={14} className="animate-spin" />,
    news: <Newspaper size={14} />,
    news_loading: <Loader2 size={14} className="animate-spin" />
  }

  const iconToUse = icon[tool] || 
    (tool === 'retrieveTool' ? icon['retrieve'] : 
     (tool === 'retrieveTool_loading' ? icon['retrieve_loading'] : 
      (tool === 'newsSearchTool' ? icon['news'] :
       (tool === 'newsSearchTool_loading' ? icon['news_loading'] : <Search size={14} />))))

  const content = typeof children === 'string' ? children : 'Link'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={className} variant={'secondary'}>
            {iconToUse}
            <span className="ml-1 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
              {children}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
