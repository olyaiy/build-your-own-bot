'use client';

import { useEffect, useState } from "react";
import { AgentCard } from "./agent-card";
import { CreateAgentCard } from "./create-agent-card";
import { Input } from "../ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  count?: number;
}

interface MyAgentListProps {
  agents: any[]; // We'll use any type to avoid type conflicts for now
  userId?: string;
  tags?: { id: string; name: string; count: number }[];
}

export function MyAgentList({ agents: initialAgents, userId, tags = [] }: MyAgentListProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState(initialAgents);
  
  // Cookie name for storing recently used agents
  const RECENT_AGENTS_COOKIE = 'recent-agents';
  const MAX_RECENT_AGENTS = 50;
  
  // Load recent agents from cookie on component mount
  useEffect(() => {
    const sortAgentsByRecentUsage = () => {
      const recentAgentsCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${RECENT_AGENTS_COOKIE}=`));
      
      if (!recentAgentsCookie) return initialAgents;
      
      const recentAgentIds = recentAgentsCookie.split('=')[1].split(',');
      
      const recentAgentPositions = new Map<string, number>();
      recentAgentIds.forEach((id, index) => {
        recentAgentPositions.set(id, index);
      });
      
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
    const recentAgentsCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${RECENT_AGENTS_COOKIE}=`));
    
    let recentAgentIds: string[] = [];
    
    if (recentAgentsCookie) {
      recentAgentIds = recentAgentsCookie.split('=')[1].split(',');
    }
    
    recentAgentIds = recentAgentIds.filter(id => id !== agentId);
    recentAgentIds.unshift(agentId);
    
    if (recentAgentIds.length > MAX_RECENT_AGENTS) {
      recentAgentIds = recentAgentIds.slice(0, MAX_RECENT_AGENTS);
    }
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    document.cookie = `${RECENT_AGENTS_COOKIE}=${recentAgentIds.join(',')}; path=/; expires=${expiryDate.toUTCString()}`;
  };

  // Filter agents based on search query
  useEffect(() => {
    let filtered = agents;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agent) => {
        return (
          (agent.agent_display_name?.toLowerCase().includes(query)) ||
          (agent.description?.toLowerCase().includes(query)) ||
          (agent.tags?.some((tag: Tag) => tag.name.toLowerCase().includes(query)))
        );
      });
    }

    setFilteredAgents(filtered);
  }, [searchQuery, agents]);

  // Empty state when user has no agents
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary-50 p-4 mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No agents yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first AI agent to start building custom assistants for your needs.
        </p>
        <Button asChild size="lg">
          <Link href="/profile/agents/create">Create Your First Agent</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search my agents..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/profile/agents/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Agent
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 justify-items-center">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            userId={userId}
            onClick={handleAgentClick}
          />
        ))}
        {!searchQuery && (
          <CreateAgentCard key="create-agent" />
        )}
      </div>
      
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No agents match your search criteria.</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
          }}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
} 