import React from 'react'
import { Link, Loader2, Search, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    video_search_loading: <Loader2 size={14} className="animate-spin" />
  }

  return (
    <Badge className={className} variant={'secondary'}>
      {icon[tool] || <Search size={14} />}
      <span className="ml-1">{children}</span>
    </Badge>
  )
}
