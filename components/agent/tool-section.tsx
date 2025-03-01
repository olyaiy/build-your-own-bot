'use client'

import { useState } from 'react'
import type { ToolInvocation } from 'ai'
import { SearchSection } from '../search/search-section'
import { RetrieveSection } from './retrieve-section'
import { Weather } from '../util/weather'
import { DocumentPreview } from '../document/document-preview'
import { DocumentToolCall, DocumentToolResult } from '../document/document'

interface ToolSectionProps {
  tool: ToolInvocation
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isReadonly?: boolean
}

export function ToolSection({ tool, isOpen, onOpenChange, isReadonly = false }: ToolSectionProps) {
  const { toolName, state, args } = tool;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use provided state management or internal state if not provided
  const effectiveIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const effectiveOnOpenChange = onOpenChange || setInternalIsOpen;

  if (state === 'result') {
    const { result } = tool;
    
    switch (toolName) {
      case 'getWeather':
        return <Weather weatherAtLocation={result} />;
      case 'createDocument':
        return <DocumentPreview isReadonly={isReadonly} result={result} />;
      case 'updateDocument':
        return <DocumentToolResult type="update" result={result} isReadonly={isReadonly} />;
      case 'requestSuggestions':
        return <DocumentToolResult type="request-suggestions" result={result} isReadonly={isReadonly} />;
      case 'retrieveTool':
        return (
          <RetrieveSection 
            tool={tool}
            isOpen={effectiveIsOpen}
            onOpenChange={effectiveOnOpenChange}
          />
        );
      case 'searchTool':
        return (
          <SearchSection 
            tool={tool}
            isOpen={effectiveIsOpen}
            onOpenChange={effectiveOnOpenChange}
          />
        );
      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  }
  
  // Handle non-result state
  switch (toolName) {
    case 'getWeather':
      return <Weather />;
    case 'createDocument':
      return <DocumentPreview isReadonly={isReadonly} args={args} />;
    case 'updateDocument':
      return <DocumentToolCall type="update" args={args} isReadonly={isReadonly} />;
    case 'requestSuggestions':
      return <DocumentToolCall type="request-suggestions" args={args} isReadonly={isReadonly} />;
    case 'retrieveTool':
      return (
        <RetrieveSection 
          tool={tool}
          isOpen={effectiveIsOpen}
          onOpenChange={effectiveOnOpenChange}
        />
      );
    case 'searchTool':
      return (
        <SearchSection 
          tool={tool}
          isOpen={effectiveIsOpen}
          onOpenChange={effectiveOnOpenChange}
        />
      );
    default:
      return null;
  }
} 