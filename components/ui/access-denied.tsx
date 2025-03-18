'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AccessHeader } from '@/components/ui/access-header';
import { SparklesIcon } from '@/components/util/icons';
import { useId } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  actionHref?: string;
  actionText?: string;
  showHeader?: boolean;
}

const BlurredConversation = () => {
  const id = useId();
  
  // Mock messages for background effect
  const mockMessages = [
    { id: `${id}-1`, isUser: false, width: 'w-3/4', height: 'h-14', delay: 0 },
    { id: `${id}-2`, isUser: true, width: 'w-1/2', height: 'h-10', delay: 0.1 },
    { id: `${id}-3`, isUser: false, width: 'w-full', height: 'h-32', delay: 0.2 },
    { id: `${id}-4`, isUser: true, width: 'w-2/3', height: 'h-12', delay: 0.3 },
    { id: `${id}-5`, isUser: false, width: 'w-5/6', height: 'h-24', delay: 0.4 },
    { id: `${id}-6`, isUser: true, width: 'w-1/3', height: 'h-8', delay: 0.5 },
    { id: `${id}-7`, isUser: false, width: 'w-3/5', height: 'h-16', delay: 0.6 },
    { id: `${id}-8`, isUser: true, width: 'w-2/5', height: 'h-10', delay: 0.7 },
    { id: `${id}-9`, isUser: false, width: 'w-4/5', height: 'h-20', delay: 0.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden z-0 opacity-50 select-none pointer-events-none">
      <div className="w-full max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-6 pt-6  h-full justify-center">
        {mockMessages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex flex-row gap-4 ${msg.isUser ? 'justify-end' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: msg.delay,
              ease: "easeOut"
            }}
          >
            {!msg.isUser && (
              <div className="size-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                <div className="text-muted-foreground opacity-40">
                  <SparklesIcon size={14} />
                </div>
              </div>
            )}
            <div
              className={`${msg.width} ${msg.height} ${
                msg.isUser
                  ? 'bg-primary/30 rounded-xl'
                  : 'bg-muted/50 rounded-lg'
              } filter blur-[1px]`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export function AccessDenied({
  title = 'Access Denied',
  message = 'Sorry, you don\'t have access to this resource.',
  actionHref = '/',
  actionText = 'Go Home',
  showHeader = false
}: AccessDeniedProps) {
  return (
    <div className="h-full overflow-hidden relative">
      {showHeader && <AccessHeader />}
      <BlurredConversation />
      <div className={`relative z-10 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center ${showHeader ? 'h-[calc(100vh-60px)]' : 'h-screen'}`}>
        <motion.div 
          className="bg-background/80 p-8 rounded-xl shadow-lg border max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <p className="mb-6 text-muted-foreground">{message}</p>
          <Button asChild className="w-full">
            <Link href={actionHref}>
              {actionText}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 