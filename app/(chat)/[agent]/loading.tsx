'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { SparklesIcon, ArrowUpIcon, PlusIcon, MenuIcon, Settings, PanelLeft } from "lucide-react";

export default function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-col min-w-0 h-dvh overflow-hidden bg-background">
      {/* Header Skeleton - matching chat-header.tsx */}
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 z-50 border-b">
        {/* Sidebar Toggle */}
        
        
        {/* New Chat Button */}
        <div className="order-2 md:order-1 md:px-0 px-2 md:h-fit ml-auto md:ml-0">
          <div className="flex items-center justify-center h-8 rounded-md border px-2">
            <PanelLeft className="size-4 text-muted-foreground" />
            <span className="md:sr-only text-xs ml-1 text-muted-foreground">New Chat</span>
          </div>
        </div>
        
        {/* Visibility Selector */}
        <Skeleton className="h-8 w-24 order-1 md:order-3" />
        
        {/* Settings Button */}
        <div className="order-1 md:order-4 flex items-center justify-center h-8 w-8 rounded-md border">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
      </header>

      {/* Messages Skeleton */}
      <div className="flex-1 min-h-0 relative overflow-y-auto p-4 space-y-6">
        {/* First user message */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-fit ml-auto max-w-2xl py-2 px-3 rounded-xl bg-muted">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex items-center justify-end mb-1">
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        </div>

        {/* Assistant message */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-full rounded-xl">
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
              <SparklesIcon size={14} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center mb-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Second user message - shorter */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-fit ml-auto max-w-2xl py-2 px-3 rounded-xl bg-muted">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex items-center justify-end mb-1">
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        </div>

        {/* Second assistant message - with code block */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-full rounded-xl">
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
              <SparklesIcon size={14} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center mb-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Third user message - very short */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-fit ml-auto max-w-2xl py-2 px-3 rounded-xl bg-muted">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex items-center justify-end mb-1">
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        </div>

        {/* Thinking message */}
        <div className="w-full mx-auto max-w-3xl px-4 group/message">
          <div className="flex gap-4 w-full rounded-xl">
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
              <SparklesIcon size={14} />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col gap-4 text-muted-foreground">
                Thinking...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="border-t p-4">
        <div className="w-full mx-auto max-w-3xl flex flex-col gap-2">
          <div className="flex items-center gap-2 w-full relative">
            <div className="flex-1 relative">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="rounded-full p-1 sm:p-1.5 h-fit border dark:border-zinc-600 flex items-center justify-center">
                <ArrowUpIcon size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}