import React, { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Image from 'next/image'

interface ImageGenerationSectionProps {
  state?: string
  result?: {
    url: string
    pathname: string
    contentType: string
  }[]
  args?: {
    prompt: string
  }
}

const ImageGenerationSection = ({ state, result, args }: ImageGenerationSectionProps = {}) => {
  const isGenerating = state !== 'result'
  const [isHovering, setIsHovering] = useState(false)
  const images = result || []

  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count === 3) return 'grid-cols-1 md:grid-cols-3'
    return 'grid-cols-1 md:grid-cols-2'
  }

  const handleDownload = async (image: typeof images[number]) => {
    if (!image?.url) return
    
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = image.pathname || 'generated-image.png'
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-2">
        {args?.prompt && (
          <p className="text-sm text-muted-foreground">
            Prompt: {args.prompt}
          </p>
        )}
        
        <div className={`grid ${getGridClass(images.length)} gap-4 w-full`}>
          {isGenerating ? (
            <div className="relative aspect-square w-full rounded-md overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          ) : images.length > 0 ? images.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-square w-full rounded-md overflow-hidden border border-border"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {image?.url ? (
                <>
                  <Image
                    src={image.url}
                    alt={`${args?.prompt || "Generated image"} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  {isHovering && (
                    <button
                      onClick={() => handleDownload(image)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-opacity z-10"
                      aria-label="Download image"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
          )) : (
            <div className="relative aspect-square w-full max-w-[400px] rounded-md overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">No images available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageGenerationSection
