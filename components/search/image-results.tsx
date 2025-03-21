'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface SearchResultItem {
  type?: string
  title?: string
  url: string
  content?: string
  thumbnail?: string
  source?: string
}

export interface SearchResultImage {
  url: string
  width?: number
  height?: number
}

export interface ImageResultsProps {
  results: SearchResultItem[]
  images: SearchResultImage[] | string[]
  query?: string
}

export function ImageResults({ results, images, query }: ImageResultsProps) {
  if (!results.length) {
    return <div className="text-muted-foreground text-sm">No image results found.</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
      {results.map((result, i) => {
        // Handle different image data structures
        const imageUrl = typeof images[i] === 'string' 
          ? images[i] as string
          : (images[i] as SearchResultImage)?.url || result.thumbnail || result.url
        
        return (
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            key={i} 
            className="overflow-hidden rounded-lg border hover:opacity-90 transition-opacity"
          >
            <div className="relative aspect-square">
              <Image
                src={imageUrl}
                alt={result.title || `Image result for ${query}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover"
                priority={i < 4}
              />
            </div>
            {result.title && (
              <div className="p-2 text-xs truncate text-muted-foreground">
                {result.title}
              </div>
            )}
          </a>
        )
      })}
    </div>
  )
} 