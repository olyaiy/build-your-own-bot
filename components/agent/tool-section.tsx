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
  addToolResult?: (result: { toolCallId: string; result: string }) => void
}

export function ToolSection({ tool, isOpen, onOpenChange, isReadonly = false, addToolResult }: ToolSectionProps) {
  const { toolName, state, args } = tool;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use provided state management or internal state if not provided
  const effectiveIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const effectiveOnOpenChange = onOpenChange || setInternalIsOpen;

  // Helper function to submit tool results when needed
  const handleToolResult = (result: string) => {
    if (addToolResult && tool.state === 'call' && tool.toolCallId) {
      addToolResult({
        toolCallId: tool.toolCallId,
        result
      });
    }
  };
  
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
            state={state}
          />
        );
      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  }
  
  // Handle non-result state (tool calls that need user interaction)
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
          state={state}
        />
      );
    default:
      // For other tools, provide a basic submit button if not readonly
      return !isReadonly ? (
        <div className="p-4 border rounded-md">
          <pre className="mb-4">{JSON.stringify(args, null, 2)}</pre>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            onClick={() => handleToolResult(JSON.stringify({ success: true }))}
          >
            Submit Result
          </button>
        </div>
      ) : null;
  }
} 