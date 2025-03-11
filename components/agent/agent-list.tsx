'use client';

import type { agents, models } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentCard } from "./agent-card";
import { CreateAgentCard } from "./create-agent-card";

interface AgentListProps {
  agents: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null;
    toolGroups?: { id: string; name: string; display_name: string; description: string | null }[] | null;
    tags?: { id: string; name: string; createdAt: Date; updatedAt: Date }[] | null;
  })[];
  userId?: string;
}

// Client component wrapper to handle cookie tracking

export function AgentList({ agents: initialAgents, userId }: AgentListProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  
  // Cookie name for storing recently used agents
  const RECENT_AGENTS_COOKIE = 'recent-agents';
  const MAX_RECENT_AGENTS = 50; // Maximum number of recent agents to track
  
  // Load recent agents from cookie on component mount
  useEffect(() => {
    const sortAgentsByRecentUsage = () => {
      // Get recent agents from cookie
      const recentAgentsCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${RECENT_AGENTS_COOKIE}=`));
      
      if (!recentAgentsCookie) return initialAgents;
      
      // Parse the cookie value to get the array of agent IDs
      const recentAgentIds = recentAgentsCookie.split('=')[1].split(',');
      
      // Create a map for quick lookup of agent positions
      const recentAgentPositions = new Map<string, number>();
      recentAgentIds.forEach((id, index) => {
        recentAgentPositions.set(id, index);
      });
      
      // Sort agents based on their position in the recent agents list
      const sortedAgents = [...initialAgents].sort((a, b) => {
        const posA = recentAgentPositions.has(a.id) ? recentAgentPositions.get(a.id)! : Number.MAX_SAFE_INTEGER;
        const posB = recentAgentPositions.has(b.id) ? recentAgentPositions.get(b.id)! : Number.MAX_SAFE_INTEGER;
        return posA - posB;
      });
      
      return sortedAgents;
    };
    
    setAgents(sortAgentsByRecentUsage());
  }, [initialAgents]);
  
  // Function to update the recent agents cookie when an agent is clicked
  const handleAgentClick = (agentId: string) => {
    // Get current recent agents from cookie
    const recentAgentsCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${RECENT_AGENTS_COOKIE}=`));
    
    let recentAgentIds: string[] = [];
    
    if (recentAgentsCookie) {
      recentAgentIds = recentAgentsCookie.split('=')[1].split(',');
    }
    
    // Remove the clicked agent if it already exists in the list
    recentAgentIds = recentAgentIds.filter(id => id !== agentId);
    
    // Add the clicked agent to the beginning of the list
    recentAgentIds.unshift(agentId);
    
    // Limit the list to MAX_RECENT_AGENTS
    if (recentAgentIds.length > MAX_RECENT_AGENTS) {
      recentAgentIds = recentAgentIds.slice(0, MAX_RECENT_AGENTS);
    }
    
    // Set the cookie with the updated list
    // Set cookie to expire in 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    document.cookie = `${RECENT_AGENTS_COOKIE}=${recentAgentIds.join(',')}; path=/; expires=${expiryDate.toUTCString()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {agents.map((agent) => (
        <AgentCard 
          key={agent.id}
          agent={agent}
          userId={userId}
          onClick={handleAgentClick}
        />
      ))}
      {userId && <CreateAgentCard key="create-agent" />}
    </div>
  );
} 