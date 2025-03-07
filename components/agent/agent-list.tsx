'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import Image from 'next/image';
import type { Agent, agents, Model, models } from "@/lib/db/schema";
import { Plus } from "lucide-react";
import { AgentCardSettings } from "./agent-card-settings";
import { InferSelectModel } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AgentListProps {
  agents: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null;
    toolGroups?: { id: string; name: string; display_name: string; description: string | null }[] | null;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Link 
          key={agent.id} 
          href={`/${agent.id}`}
          onClick={() => handleAgentClick(agent.id)}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative group h-[270px] flex flex-col">
            {agent.visibility !== 'public' && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-muted">
                  {agent.visibility}
                </Badge>
              </div>
            )}
            
            <div className="h-36 mb-2 rounded-lg bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 relative">
              {agent.image_url ? (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <Image
                    src={agent.image_url}
                    alt={agent.agent_display_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700 rounded-lg"></div>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-1 line-clamp-1">{agent.agent_display_name}</h3>
            <p className="text-xs text-muted-foreground mb-1 line-clamp-2 flex-1">
              {agent.description}
            </p>
            
            <div className="flex flex-col gap-1 mt-auto">
              {/* Models display */}
              {agent.models && agent.models.length > 0 && (
                <div className="flex items-center gap-1 max-w-full overflow-hidden">
                  <div className="text-xs text-muted-foreground mr-1">Models:</div>
                  {/* Display first two models */}
                  {agent.models.slice(0, 2).map((model) => (
                    <Badge 
                      key={model.id} 
                      variant="secondary" 
                      className="text-[10px] px-2 py-0 h-5 truncate max-w-28"
                    >
                      {model.model_display_name}
                    </Badge>
                  ))}
                  
                  {/* If there are more than 2 models, show a +n badge */}
                  {agent.models.length > 2 && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-2 py-0 h-5"
                    >
                      +{agent.models.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Tool Groups display */}
              {agent.toolGroups && agent.toolGroups.length > 0 && (
                <div className="flex items-center gap-1 max-w-full overflow-hidden ">
                  <div className="text-xs text-muted-foreground mr-1">Tools:</div>
                  {/* Display first two tool groups */}
                  {agent.toolGroups.slice(0, 2).map((toolGroup) => (
                    <Badge 
                      key={toolGroup.id} 
                      variant="outline" 
                      className="text-[10px] px-2 py-0 h-5 truncate max-w-28 border-dashed"
                    >
                      {toolGroup.display_name}
                    </Badge>
                  ))}
                  
                  {/* If there are more than 2 tool groups, show a +n badge */}
                  {agent.toolGroups.length > 2 && (
                    <Badge 
                      variant="outline" 
                      className="text-[10px] px-2 py-0 h-5 border-dashed"
                    >
                      +{agent.toolGroups.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-end ">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <AgentCardSettings 
                    agentId={agent.id}
                    userId={userId}
                    creatorId={agent.creatorId}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
      {userId && (
        <Link key="create-agent" href="/agents/create">
          <Card className="h-[270px] flex items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <Plus className="size-8" />
          </Card>
        </Link>
      )}
    </div>
  );
} 