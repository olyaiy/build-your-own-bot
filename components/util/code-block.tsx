'use client';

import { useState } from 'react';
import { CopyButton } from '@/components/util/copy-button';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [isHovering, setIsHovering] = useState(false);

  if (!inline) {
    return (
      <div 
        className="not-prose flex flex-col relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto bg-zinc-900 dark:bg-zinc-900 p-4 border border-zinc-700 dark:border-zinc-700 rounded-xl text-zinc-50 dark:text-zinc-50`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
        </pre>
        {isHovering && (
          <div className="absolute bottom-2 right-2">
            <CopyButton 
              textToCopy={children.toString()} 
              className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            />
          </div>
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
