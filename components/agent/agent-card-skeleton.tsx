'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AgentCardSkeleton() {
  return (
    <div className="w-full">
      <Card className="p-4 relative h-[270px] min-w-[240px] max-w-[400px] w-full mx-auto flex flex-col">
        {/* Image placeholder */}
        <div className="h-36 mb-2 rounded-lg relative">
          <Skeleton className="absolute inset-0 rounded-lg" />
        </div>

        {/* Title placeholder */}
        <Skeleton className="h-6 w-4/5 mb-1" />
        
        {/* Description placeholder */}
        <Skeleton className="h-4 w-full mb-1 flex-1" />
        
        <div className="flex flex-col gap-1 mt-auto">
          {/* Models line */}
          <div className="flex items-center gap-1 max-w-full overflow-hidden">
            <Skeleton className="h-4 w-12 mr-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Tools line */}
          <div className="flex items-center gap-1 max-w-full overflow-hidden">
            <Skeleton className="h-4 w-12 mr-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          {/* Settings button area */}
          <div className="flex items-center justify-end">
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
} 