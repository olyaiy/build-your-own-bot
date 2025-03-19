'use client'

import React, { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import Image from 'next/image'

interface LogoTool {
  state: string
  toolCallId: string
  toolName: string
  args: {
    prompt: string
    aspectRatio?: string
    style?: string
    expandPrompt?: boolean
  }
  result?: {
    imageUrl: string
    seed: number
    error?: string
  }
}

interface LogoGenerationSectionProps {
  tool?: LogoTool
}

const LogoGenerationSection = ({ tool }: LogoGenerationSectionProps = {}) => {
  const isGenerating = tool?.state !== 'result'
  const [isHovering, setIsHovering] = useState(false)
  
  const logoUrl = tool?.result?.imageUrl
  const hasError = tool?.result?.error

  const handleDownload = async () => {
    if (!logoUrl) return
    
    try {
      const response = await fetch(logoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = 'generated-logo.png'
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading logo:', error)
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-2">
        {tool?.args && (
          <div className="space-y-1 mb-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Prompt:</span> {tool.args.prompt}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {tool.args.aspectRatio && (
                <span className="bg-muted px-2 py-1 rounded-md">
                  Aspect: {tool.args.aspectRatio}
                </span>
              )}
              {tool.args.style && (
                <span className="bg-muted px-2 py-1 rounded-md">
                  Style: {tool.args.style}
                </span>
              )}
              {tool.args.expandPrompt !== undefined && (
                <span className="bg-muted px-2 py-1 rounded-md">
                  Expand prompt: {tool.args.expandPrompt ? 'Yes' : 'No'}
                </span>
              )}
              {tool.result?.seed && (
                <span className="bg-muted px-2 py-1 rounded-md">
                  Seed: {tool.result.seed}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="w-full">
          {isGenerating ? (
            <div className="relative aspect-square w-full max-w-[400px] mx-auto rounded-md overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            </div>
          ) : hasError ? (
            <div className="relative aspect-square w-full max-w-[400px] mx-auto rounded-md overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-sm text-destructive">{hasError}</p>
              </div>
            </div>
          ) : logoUrl ? (
            <div 
              className="relative aspect-square w-full max-w-[400px] mx-auto rounded-md overflow-hidden border border-border"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Image
                src={logoUrl}
                alt={tool?.args?.prompt || "Generated logo"}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {isHovering && (
                <button
                  onClick={handleDownload}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-opacity z-10"
                  aria-label="Download logo"
                >
                  <Download className="size-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative aspect-square w-full max-w-[400px] mx-auto rounded-md overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">No logo available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LogoGenerationSection 