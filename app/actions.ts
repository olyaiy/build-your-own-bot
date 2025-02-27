'use server';

import { cookies } from 'next/headers';
import { InferSelectModel } from 'drizzle-orm';
import { agents, models } from '@/lib/db/schema';

// Function to sort agents based on recent usage cookie
export async function sortAgentsByRecentUsage(
  agentsList: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null
  })[]
) {
  const cookieStore = await cookies();
  const recentAgentsCookie = cookieStore.get('recent-agents');
  
  if (!recentAgentsCookie) {
    return agentsList;
  }
  
  // Parse the cookie value to get the array of agent IDs
  const recentAgentIds = recentAgentsCookie.value.split(',');
  
  // Create a map for quick lookup of agent positions
  const recentAgentPositions = new Map<string, number>();
  recentAgentIds.forEach((id: string, index: number) => {
    recentAgentPositions.set(id, index);
  });
  
  // Sort agents based on their position in the recent agents list
  const sortedAgents = [...agentsList].sort((a, b) => {
    const posA = recentAgentPositions.has(a.id) ? recentAgentPositions.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const posB = recentAgentPositions.has(b.id) ? recentAgentPositions.get(b.id)! : Number.MAX_SAFE_INTEGER;
    return posA - posB;
  });
  
  return sortedAgents;
} 