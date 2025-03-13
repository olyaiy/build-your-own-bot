'use client'

import { useState, useEffect } from 'react'
import type { ToolInvocation } from 'ai'
import { SearchSection } from '../search/search-section'
import { RetrieveSection } from './retrieve-section'
import { Weather } from '../util/weather'
import { DocumentPreview } from '../document/document-preview'
import { DocumentToolCall, DocumentToolResult } from '../document/document'
import { skip } from 'node:test'
import ImageGenerationSection from './image-generation-section'

interface ToolSectionProps {
  tool: ToolInvocation
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isReadonly?: boolean
  addToolResult?: (result: { toolCallId: string; result: string }) => void
}

export function ToolSection({ tool, isOpen, onOpenChange, isReadonly = false }: ToolSectionProps) {
  const { toolName, state, args } = tool;
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  
  
  // Use provided state management or internal state if not provided
  const effectiveIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const effectiveOnOpenChange = onOpenChange || setInternalIsOpen;
  
  const handleOpenChange = (open: boolean) => {
    effectiveOnOpenChange(open);
  }
  
  useEffect(() => {
  }, [effectiveIsOpen, tool.toolCallId])

 
  // Common wrapper for all tool sections to ensure proper width constraints
  const ToolWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-full overflow-hidden">
      {children}
    </div>
  );
  
  if (state === 'result') {
    const { result } = tool;
    
    switch (toolName) {
      case 'getWeather':
        return <ToolWrapper><Weather weatherAtLocation={result} /></ToolWrapper>;
      case 'createImage':
        console.log('🔍 CREATE IMAGE TOOL CALLED INSIDE TOOL SECTION UI --------------------------------')
        console.log('🌐 TOOL STATE:', state)
        console.log('🔍 TOOL:', tool)
        return <ToolWrapper><ImageGenerationSection state={state} result={result} args={args} /></ToolWrapper>;
      case 'createDocument':
        return <ToolWrapper><DocumentPreview isReadonly={isReadonly} result={result} /></ToolWrapper>;
      case 'updateDocument':
        return <ToolWrapper><DocumentToolResult type="update" result={result} isReadonly={isReadonly} /></ToolWrapper>;
      case 'requestSuggestions':
        return <ToolWrapper><DocumentToolResult type="request-suggestions" result={result} isReadonly={isReadonly} /></ToolWrapper>;
      case 'retrieveTool':
        return (
          <ToolWrapper>
            <RetrieveSection 
              tool={tool}
              isOpen={effectiveIsOpen}
              onOpenChange={handleOpenChange}
              state={state}
            />
          </ToolWrapper>
        );
      case 'searchTool':

        return (
          <ToolWrapper>
            <SearchSection 
              tool={tool}
              isOpen={effectiveIsOpen}
              onOpenChange={handleOpenChange}
              state={state}
            />
          </ToolWrapper>
        );
      default:
        return <ToolWrapper><pre className="whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre></ToolWrapper>;
    }
  }
  
  // Handle non-result state (tool calls that need user interaction)
  switch (toolName) {
    case 'getWeather':
      return <ToolWrapper><Weather /></ToolWrapper>;
    case 'createImage':
      return <ToolWrapper><ImageGenerationSection state={state} args={args} /></ToolWrapper>;
    case 'createDocument':
      return <ToolWrapper><DocumentPreview isReadonly={isReadonly} args={args} /></ToolWrapper>;
    case 'updateDocument':
      return <ToolWrapper><DocumentToolCall 
        type="update" 
        args={{ title: args?.title || 'Untitled Document' }} 
        isReadonly={isReadonly} 
      /></ToolWrapper>;
    case 'requestSuggestions':
      return <ToolWrapper><DocumentToolCall 
        type="request-suggestions" 
        args={{ title: args?.title || 'Untitled Document' }} 
        isReadonly={isReadonly} 
      /></ToolWrapper>;
    case 'retrieveTool':
      return (
        <ToolWrapper>
          <RetrieveSection 
            tool={tool}
            isOpen={effectiveIsOpen}
            onOpenChange={handleOpenChange}
            state={state}
          />
        </ToolWrapper>
      );
    case 'searchTool':
      return (
        <ToolWrapper>
          <SearchSection 
            tool={tool}
            isOpen={effectiveIsOpen}
            onOpenChange={handleOpenChange}
            state={state}
          />
        </ToolWrapper>
      );
    default:
      // For other tools, provide a basic submit button if not readonly
      return !isReadonly ? (
        <ToolWrapper>
          <div className="p-4 border rounded-md">
           
          </div>
        </ToolWrapper>
      ) : null;
  }
} 