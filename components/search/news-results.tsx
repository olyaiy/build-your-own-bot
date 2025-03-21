'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export type NewsResultItem = {
  title: string
  url: string
  content: string
  metadata: {
    source: string
    date?: string
    thumbnail?: string
    age?: string
  }
  type: 'news'
}

export interface NewsResultsProps {
  results: NewsResultItem[]
}

export function NewsResults({ results }: NewsResultsProps) {
  const [showAllResults, setShowAllResults] = useState(false)

  const handleViewMore = () => {
    setShowAllResults(true)
  }

  const displayedResults = showAllResults ? results : results.slice(0, 3)
  const additionalResultsCount = results.length > 3 ? results.length - 3 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {displayedResults.map((result, index) => (
        <Link href={result.url} key={index} passHref target="_blank">
          <Card className="h-full transition-all duration-150 hover:scale-[1.02] hover:shadow-md hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
            <CardContent className="p-3 flex gap-3">
              {result.metadata.thumbnail && (
                <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
                  <img 
                    src={result.metadata.thumbnail} 
                    alt={result.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} 
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{result.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{result.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{result.metadata.source}</span>
                  </div>
                  {result.metadata.age && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{result.metadata.age}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      {!showAllResults && additionalResultsCount > 0 && (
        <Card className="flex items-center justify-center p-3">
          <Button 
            variant="link" 
            className="text-muted-foreground"
            onClick={handleViewMore}
          >
            View {additionalResultsCount} more articles
          </Button>
        </Card>
      )}
    </div>
  )
} 