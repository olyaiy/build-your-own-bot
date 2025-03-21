'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageResultsProps {
  results: Array<{
    type?: string
    title?: string
    link?: string
    imageUrl?: string
    [key: string]: any
  }>
  images: Array<{
    url: string
    alt?: string
    [key: string]: any
  } | string>
  query?: string
}

export function ImageResults({ results, images, query }: ImageResultsProps) {
  // Use either results with imageUrl or the images array
  const displayImages = results.length > 0 
    ? results.filter(item => item.imageUrl).map(item => ({
        url: item.imageUrl as string,
        alt: item.title || query || 'Search result image',
        link: item.link
      }))
    : images.map(img => typeof img === 'string' 
        ? { url: img, alt: query || 'Search result image' }
        : img
      )

  if (!displayImages.length) {
    return <div className="text-muted-foreground">No image results found</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayImages.map((image, i) => (
        <div key={i} className="relative group aspect-square overflow-hidden rounded-md border">
          <Image
            src={image.url}
            alt={image.alt || ''}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          {image.link && (
            <a 
              href={image.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button size="icon" variant="secondary" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      ))}
    </div>
  )
} 