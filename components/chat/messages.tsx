import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from '@/components/chat/message';
import { useScrollToBottom } from '@/components/hooks/use-scroll-to-bottom';
import { useState, useMemo, memo, useEffect } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { Overview } from '../util/overview';
import { ToolSection } from '../agent/tool-section';

/**
 * Interface defining the props for the Messages component
 * @property {string} chatId - Unique identifier for the current chat
 * @property {boolean} isLoading - Flag indicating if a message is currently being processed/loaded
 * @property {Array<Vote>} votes - Collection of vote data for the messages in this chat
 * @property {Array<Message>} messages - The chat messages to be displayed
 * @property {Function} setMessages - State setter function to update messages
 * @property {Function} reload - Function to reload/regenerate the chat conversation
 * @property {boolean} isReadonly - Flag to prevent message interaction when true
 * @property {boolean} isArtifactVisible - Flag for artifact visibility that affects render optimization
 * @property {Array<any>} toolCallData - Optional array of tool invocation data
 * @property {Function} addToolResult - Function to add a tool result to the chat
 */
interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  toolCallData?: Array<any>;
  addToolResult?: (result: { toolCallId: string; result: string }) => void;
}

/**
 * PureMessages - Core implementation of the Messages component
 * 
 * This component handles rendering the chat interface, including:
 * - Empty state with Overview component
 * - List of messages with their voting state
 * - Loading/thinking indicators
 * - Auto-scrolling to the latest message
 * - Tool sections for AI interactions
 * 
 * The component is designed to be memoized for performance optimization.
 */
function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  toolCallData,
  addToolResult,
}: MessagesProps) {

  // Custom hook that provides refs for container and end element
  // to enable automatic scrolling to the bottom when new messages arrive
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  
  // State to track open/closed state of tool sections
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  
  // Process the last tool data from the provided data array for conditional rendering
  const lastToolData = useMemo(() => {
    if (!toolCallData || !Array.isArray(toolCallData) || toolCallData.length === 0) return null;

    const lastItem = toolCallData[toolCallData.length - 1];
    
    // Ensure the item has the expected format
    if (!lastItem || typeof lastItem !== 'object' || !('type' in lastItem)) return null;
    
    if (lastItem.type !== 'tool_call') return null;

    const toolCallDetails = lastItem.data;
    return {
      state: 'call' as const,
      toolCallId: toolCallDetails.toolCallId,
      toolName: toolCallDetails.toolName,
      args: toolCallDetails.args ? JSON.parse(toolCallDetails.args) : undefined
    };
  }, [toolCallData]);

  // Handler for tool section open state changes
  const handleOpenChange = (id: string, open: boolean) => {
    setOpenStates(prev => {
      const newState = {
        ...prev,
        [id]: open
      };
      return newState;
    });
  };


  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 absolute inset-0 overflow-y-auto pt-4 px-4 md:px-0"
    >
      {/* Show the Overview component when there are no messages */}
      {messages.length === 0 && <Overview />}

      {/* Render each message with its associated metadata and interactions */}
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          // Only show loading state on the last message when it's an AI response being generated
          isLoading={isLoading && messages.length - 1 === index}
          // Find the vote for this specific message if votes exist
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {/* Show thinking message when waiting for first assistant response */}
      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && 
        !lastToolData && <ThinkingMessage />
      }

      {/* Show tool section when actively processing a tool call */}
      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && 
        lastToolData && (
          <ToolSection
            tool={lastToolData}
            isOpen={openStates[lastToolData.toolCallId] ?? true}
            onOpenChange={(open) => handleOpenChange(lastToolData.toolCallId, open)}
            isReadonly={isReadonly}
            addToolResult={addToolResult}
          />
        )
      }

      {/* Empty div at the end for scroll targeting */}
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

/**
 * Messages - Memoized version of the chat messages component
 * 
 * The component is wrapped with React.memo and uses a custom comparison function
 * to optimize rendering performance by preventing unnecessary re-renders.
 * 
 * The comparison logic handles several scenarios:
 * 1. If artifact is visible in both prev and next props, skip re-render
 * 2. Always re-render when loading state changes
 * 3. Always re-render during continuous loading
 * 4. Re-render when message count changes
 * 5. Re-render when message content changes (using deep equality)
 * 6. Re-render when votes change (using deep equality)
 * 7. Re-render when tool data changes (using deep equality)
 */
export const Messages = memo(PureMessages, (prevProps: MessagesProps, nextProps: MessagesProps) => {
  
  const shouldRerender = (() => {
    // Skip re-render if artifact is visible in both states
    if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

    // Force re-render if loading state changes
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    // Continue rendering during loading state to show progress
    if (prevProps.isLoading && nextProps.isLoading) return false;
    // Re-render if messages are added or removed
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    // Deep comparison of messages to detect content changes
    if (!equal(prevProps.messages, nextProps.messages)) return false;
    // Re-render if votes change
    if (!equal(prevProps.votes, nextProps.votes)) return false;
    // Re-render if tool data changes
    if (!equal(prevProps.toolCallData, nextProps.toolCallData)) return false;

    // Skip re-render if none of the above conditions are met
    return true;
  })();
  
  
  return shouldRerender;
});
