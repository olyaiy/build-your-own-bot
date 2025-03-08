'use client';

import { AgentCardSkeleton } from "./agent-card-skeleton";

export function AgentListSkeleton() {
  // Generate an array of 8 items to represent loading agents
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {skeletonItems.map((index) => (
        <AgentCardSkeleton key={index} />
      ))}
    </div>
  );
} 