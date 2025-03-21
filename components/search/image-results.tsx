'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Globe, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export type ImageResultItem = {
  title: string
  url: string
  content: string
  metadata: {
    source: string
    date?: string
    thumbnail?: string
  }
  type: 'image'
}

export interface ImageResultsProps {
  results: ImageResultItem[]
  images: Array<{
    src: string
    alt: string
    url: string
    properties?: any
  }>
  query?: string
}

export function ImageResults({ results, images, query }: ImageResultsProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showAllResults, setShowAllResults] = useState(false)

  useEffect(() => {
    if (!api) return
    
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Scroll to the selected index when it changes
  useEffect(() => {
    if (api) {
      api.scrollTo(selectedIndex, true)
    }
  }, [api, selectedIndex])

  const handleViewMore = () => {
    setShowAllResults(true)
  }

  // No images found
  if (!images || images.length === 0) {
    return <div className="text-muted-foreground">No images found</div>
  }

  // Limit the grid display to first 8 images unless showing all
  const displayedResults = showAllResults ? results : results.slice(0, 8)
  const additionalResultsCount = results.length > 8 ? results.length - 8 : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {displayedResults.map((result, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <Card className="h-full transition-all duration-150 hover:scale-[1.02] hover:shadow-md hover:bg-blue-50/80 dark:hover:bg-blue-900/20 cursor-pointer" onClick={() => setSelectedIndex(index)}>
              <CardContent className="p-2 flex flex-col h-full">
                <div className="aspect-square rounded-md overflow-hidden mb-2 bg-muted">
                  {result.metadata.thumbnail ? (
                    <img 
                      src={result.metadata.thumbnail} 
                      alt={result.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }} 
                    />
                  ) : (
                    <div className="w-full h-full bg-muted animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs line-clamp-1 mb-1">{result.title}</h3>
                  {result.metadata.source && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{result.metadata.source}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Image Results</DialogTitle>
              <DialogDescription className="text-sm">{query}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Carousel setApi={setApi} className="w-full bg-muted max-h-[60vh]">
                <CarouselContent>
                  {images.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="p-1 flex flex-col items-center justify-center h-full">
                        <div className="relative w-full h-full flex items-center justify-center max-h-[50vh]">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="max-w-full max-h-[50vh] object-contain"
                            onError={e => (e.currentTarget.src = '/images/placeholder-image.jpg')}
                          />
                        </div>
                        <Link href={img.url} target="_blank" className="mt-4 text-sm text-blue-600 hover:underline">
                          View original
                        </Link>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute inset-8 flex items-center justify-between p-4">
                  <CarouselPrevious className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Previous</span>
                  </CarouselPrevious>
                  <CarouselNext className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Next</span>
                  </CarouselNext>
                </div>
              </Carousel>
              <div className="py-2 text-center text-sm text-muted-foreground">
                {current} of {count}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
      
      {!showAllResults && additionalResultsCount > 0 && (
        <Card className="flex items-center justify-center p-3 h-full">
          <Button 
            variant="link" 
            className="text-muted-foreground"
            onClick={handleViewMore}
          >
            View {additionalResultsCount} more images
          </Button>
        </Card>
      )}
    </div>
  )
} 