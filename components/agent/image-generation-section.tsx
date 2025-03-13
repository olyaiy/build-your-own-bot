import React, { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Image from 'next/image'

interface ImageGenerationSectionProps {
  state?: string
  result?: {
    url: string
    pathname: string
    contentType: string
  }
  args?: {
    prompt: string
  }
}

const ImageGenerationSection = ({ state, result, args }: ImageGenerationSectionProps = {}) => {
  const isGenerating = state !== 'result'
  const [isHovering, setIsHovering] = useState(false)
  
  const handleDownload = async () => {
    if (!result?.url) return
    
    try {
      // Fetch the image
      const response = await fetch(result.url)
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Use pathname for the download filename if available, otherwise use a default name
      const filename = result.pathname || 'generated-image.png'
      link.setAttribute('download', filename)
      
      // Trigger the download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
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
        
        <div 
          className="relative aspect-square w-full max-w-[400px] rounded-md overflow-hidden border border-border"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : result?.url ? (
            <>
              <Image
                src={result.url}
                alt={args?.prompt || "Generated image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {isHovering && (
                <button
                  onClick={handleDownload}
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
      </div>
    </div>
  )
}

export default ImageGenerationSection
