'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CopyIcon,
  PencilEditIcon,
  SparklesIcon,
} from '@/components/util/icons';
import { Markdown } from '@/components/util/markdown';
import { MessageActions } from '@/components/chat/message-actions';

import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageEditor } from '@/components/chat/message-editor';
import { MessageReasoning } from '@/components/chat/message-reasoning';
import { PreviewAttachment } from '../util/preview-attachment';
import { ToolSection } from '../agent/tool-section';
import { CopyButton } from '@/components/util/copy-button';

const ToolInvocationItem = memo(({ 
  toolInvocation, 
  isReadonly,
  isCompact = false
}: { 
  toolInvocation: any; 
  isReadonly: boolean;
  isCompact?: boolean;
}) => {
  const [isToolOpen, setIsToolOpen] = useState(false);
  
  return (
    <div 
      key={toolInvocation.toolCallId} 
      className={cn(
        "w-full max-w-full overflow-scroll",
        isCompact && "max-w-[310px]"
      )}
    >
      <ToolSection
        tool={toolInvocation}
        isOpen={isToolOpen}
        onOpenChange={setIsToolOpen}
        isReadonly={isReadonly}
      />
    </div>
  );
});

// Add display name for the memoized component
ToolInvocationItem.displayName = 'ToolInvocationItem';

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  agentImageUrl,
  isCompact = false,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  agentImageUrl?: string;
  isCompact?: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Process the message to extract content and reasoning from either format
  const processMessageContent = (message: Message) => {
    // For messages with parts (new format)
    if (message.parts && Array.isArray(message.parts)) {
      let textContent = '';
      let reasoningContent = null;
      
      message.parts.forEach(part => {
        if (part.type === 'text' && part.text) {
          textContent += part.text;
        } else if (part.type === 'reasoning') {
          // Extract the reasoning content from the part
          reasoningContent = part.reasoning || '';
        }
      });
      
      return {
        content: textContent || message.content,
        reasoning: reasoningContent || message.reasoning
      };
    }
    
    // For legacy format
    return {
      content: message.content,
      reasoning: message.reasoning
    };
  };

  const { content, reasoning } = processMessageContent(message);
  const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-0 group/message relative"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        
        <div
          className={cn(
            'flex flex-col sm:flex-row gap-4 w-full group-data-[role=user]/message:ml-auto',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
              'group-data-[role=user]/message:max-w-2xl': !isCompact,
            },
          )}
        >
          
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background overflow-hidden relative">
              {agentImageUrl ? (
                <Image 
                  src={agentImageUrl} 
                  alt="Agent avatar" 
                  width={32} 
                  height={32} 
                  className="size-full object-cover"
                />
              ) : (
                <div className="translate-y-px">
                  <SparklesIcon size={14} />
                </div>
              )}
            </div>
          )}

          <div className={cn("flex flex-col gap-4 w-full relative ", {
            "max-w-full": !isCompact,
          })}>
            
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={reasoning}
              />
            )}

            {/* Edit and Copy buttons for user messages */}
            {message.role === 'user' && !isReadonly && mode === 'view' && (
              <div className="flex justify-end gap-1">
                <CopyButton 
                  textToCopy={content as string} 
                  className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100 relative"
                />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                      onClick={() => {
                        setMode('edit');
                      }}
                    >
                      <PencilEditIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
              </div>
            )}

            

            {/* Message content section */}
            {(content || reasoning) && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 ml-12 py-2 rounded-xl max-w-full':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{content as string}</Markdown>
                </div>
              </div>
            )}

            {/* Edit message section */}
            {mode === 'edit' && content && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={{
                    ...message,
                    content: content as string
                  }}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

 {/* Tool invocations section */}
 {hasToolInvocations && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations?.map((toolInvocation) => (
                  <ToolInvocationItem 
                    key={toolInvocation.toolCallId} 
                    toolInvocation={toolInvocation} 
                    isReadonly={isReadonly} 
                    isCompact={isCompact}
                  />
                ))}
              </div>
            )}

           

            {/* Message actions section */}
            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                isLoading={isLoading}
              />
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    // Check for loading state changes
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    
    // Check for reasoning updates - simplified check
    if (prevProps.message.reasoning !== nextProps.message.reasoning) return false;
        
    // Check if compact mode changed
    if (prevProps.isCompact !== nextProps.isCompact) return false;
    
    // Check if agentImageUrl changed
    if (prevProps.agentImageUrl !== nextProps.agentImageUrl) return false;
    
    // Check content changes
    if (prevProps.message.content !== nextProps.message.content) return false;
    
    // Check tool invocations
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
      

    // Also compare token_usage to prevent unnecessary rerenders
    if ((prevProps.message as any).token_usage !== (nextProps.message as any).token_usage) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl ',
          {
            'group-data-[role=user]/message:bg-muted ': true,
          },
        )}
      >
        <div className="size-8  flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};