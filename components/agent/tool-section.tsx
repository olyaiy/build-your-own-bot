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
              onOpenChange={effectiveOnOpenChange}
            />
          </ToolWrapper>
        );
      case 'searchTool':
        return (
          <ToolWrapper>
            <SearchSection 
              tool={tool}
              isOpen={effectiveIsOpen}
              onOpenChange={effectiveOnOpenChange}
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
            onOpenChange={effectiveOnOpenChange}
          />
        </ToolWrapper>
      );
    case 'searchTool':
      return (
        <ToolWrapper>
          <SearchSection 
            tool={tool}
            isOpen={effectiveIsOpen}
            onOpenChange={effectiveOnOpenChange}
          />
        </ToolWrapper>
      );
    default:
      // For other tools, provide a basic submit button if not readonly
      return !isReadonly ? (
        <ToolWrapper>
          <div className="p-4 border rounded-md">
            <pre className="mb-4 whitespace-pre-wrap break-all">{JSON.stringify(args, null, 2)}</pre>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => handleToolResult(JSON.stringify({ success: true }))}
            >
              Submit Result
            </button>
          </div>
        </ToolWrapper>
      ) : null;
  }
} 