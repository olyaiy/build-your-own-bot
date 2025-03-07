'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoadingSkeleton() {
  return (
    <div className="flex flex-col min-w-0 h-dvh overflow-hidden bg-background">
      {/* Header Skeleton */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 min-h-0 relative overflow-y-auto p-4 space-y-6">
        {/* User message */}
        <div className="flex items-start gap-3 max-w-3xl ml-auto">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-end mb-1">
              <Skeleton className="h-6 w-16 ml-auto" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full mt-1" />
        </div>

        {/* Assistant message */}
        <div className="flex items-start gap-3 max-w-3xl">
          <Skeleton className="h-8 w-8 rounded-full mt-1" />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center mb-1">
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>

        {/* Another user message */}
        <div className="flex items-start gap-3 max-w-3xl ml-auto">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center justify-end mb-1">
              <Skeleton className="h-6 w-16 ml-auto" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full mt-1" />
        </div>

        {/* Loading indicator for active response */}
        <div className="flex items-start gap-3 max-w-3xl">
          <Skeleton className="h-8 w-8 rounded-full mt-1" />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center mb-1">
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-3 w-3 rounded-full animate-pulse" />
              <Skeleton className="h-3 w-3 rounded-full animate-pulse delay-100" />
              <Skeleton className="h-3 w-3 rounded-full animate-pulse delay-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="flex flex-col mx-auto px-2 sm:px-4 bg-background pb-1 sm:pb-2 md:pb-4 gap-1 sm:gap-2 w-full md:max-w-3xl">
        <div className="relative">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="absolute right-3 top-2 flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}