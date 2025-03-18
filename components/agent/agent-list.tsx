'use client';

import type { agents, models } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentCard } from "./agent-card";
import { CreateAgentCard } from "./create-agent-card";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { TagFilters } from "./tag-filters";

interface AgentListProps {
  agents: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null;
    toolGroups?: { id: string; name: string; display_name: string; description: string | null }[] | null;
    tags?: { id: string; name: string; createdAt: Date; updatedAt: Date }[] | null;
  })[];
  userId?: string;
  tags?: { id: string; name: string; count: number }[];
}

// Client component wrapper to handle cookie tracking

export function AgentList({ agents: initialAgents, userId, tags = [] }: AgentListProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredAgents, setFilteredAgents] = useState(initialAgents);
  
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
    
    const sortedAgents = sortAgentsByRecentUsage();
    setAgents(sortedAgents);
    setFilteredAgents(sortedAgents);
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

  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagId)) {
        return prevTags.filter(id => id !== tagId);
      } else {
        return [...prevTags, tagId];
      }
    });
  };

  // Filter agents based on search query and selected tags
  useEffect(() => {
    let filtered = agents;
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agent) => {
        return (
          (agent.agent_display_name?.toLowerCase().includes(query)) ||
          (agent.description?.toLowerCase().includes(query)) ||
          (agent.tags?.some(tag => tag.name.toLowerCase().includes(query)))
        );
      });
    }
    
    // Filter by selected tags if any
    if (selectedTags.length > 0) {
      filtered = filtered.filter((agent) => {
        return agent.tags?.some(tag => selectedTags.includes(tag.id));
      });
    }

    setFilteredAgents(filtered);
  }, [searchQuery, agents, selectedTags]);

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">AI Agents</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search agents..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="overflow-x-auto">
          <TagFilters 
            tags={tags} 
            onTagSelect={handleTagSelect} 
            selectedTags={selectedTags}
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-12   sm:gap-4 md:gap-6 justify-items-center">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            userId={userId}
            onClick={handleAgentClick}
          />
        ))}
        {userId && filteredAgents.length === agents.length && !selectedTags.length && <CreateAgentCard key="create-agent" />}
      </div>
    </div>
  );
} 