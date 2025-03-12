'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CopyIcon } from '@/components/util/icons';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export function CopyButton({ textToCopy, className }: CopyButtonProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset copy success state after a delay
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Function to copy message content to clipboard
  const copyToClipboard = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => setCopySuccess(true))
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={className || "px-2 h-fit rounded-full text-muted-foreground"}
          onClick={copyToClipboard}
          disabled={copySuccess}
        >
          <AnimatePresence mode="wait">
            {copySuccess ? (
              <motion.div
                key="check"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="text-green-500"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3334 4L6.00002 11.3333L2.66669 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <CopyIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copySuccess ? "Copied!" : "Copy"}</TooltipContent>
    </Tooltip>
  );
} 