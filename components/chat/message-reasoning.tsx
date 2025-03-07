'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from '@/components/util/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from '@/components/util/markdown';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string | { type: string; details: Array<{type: string; text?: string}> };
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  // Process the reasoning content based on its format
  const getReasoningContent = () => {
    // If reasoning is a string (old format), return it directly
    if (typeof reasoning === 'string') {
      return reasoning;
    }
    
    // If reasoning is an object with the new format (type + details)
    if (reasoning && typeof reasoning === 'object' && 'details' in reasoning) {
      return reasoning.details
        .filter(detail => detail.type === 'text' && detail.text)
        .map(detail => detail.text)
        .join('\n\n');
    }
    
    // Fallback for unexpected formats
    return JSON.stringify(reasoning);
  };

  const reasoningContent = getReasoningContent();

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoned for a few seconds</div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon />
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <Markdown>{reasoningContent}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}