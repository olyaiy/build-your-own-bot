'use client';

import { useEffect, useState } from "react";
import { CreateAgentCard } from "./create-agent-card";
import { Input } from "../ui/input";
import { Search, Plus, CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { MyAgentCard } from "./my-agent-card";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  timePeriod?: string;
}

export function MyAgentList({ agents: initialAgents, userId, tags = [], timePeriod = 'all-time' }: MyAgentListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState(initialAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState(initialAgents);
  
  // Cookie name for storing recently used agents
  const RECENT_AGENTS_COOKIE = 'recent-agents';
  const MAX_RECENT_AGENTS = 50;
  
  // Function to handle time period changes
  const handleTimePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('timePeriod', value);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Load recent agents from cookie on component mount
  useEffect(() => {
    const sortAgentsByEarningsAndRecentUsage = () => {
      // First sort by earnings (totalSpent), highest first
      const agentsSortedByEarnings = [...initialAgents].sort((a, b) => {
        // Sort by totalSpent first (highest earnings first)
        const totalSpentDiff = (b.totalSpent || 0) - (a.totalSpent || 0);
        
        // If earnings are equal, use recent usage as tiebreaker
        if (totalSpentDiff === 0) {
          const recentAgentsCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${RECENT_AGENTS_COOKIE}=`));
          
          if (!recentAgentsCookie) return 0;
          
          const recentAgentIds = recentAgentsCookie.split('=')[1].split(',');
          
          const posA = recentAgentIds.indexOf(a.id);
          const posB = recentAgentIds.indexOf(b.id);
          
          // If both are in recent agents, compare positions
          if (posA !== -1 && posB !== -1) return posA - posB;
          // If only a is in recent agents, a comes first
          if (posA !== -1) return -1;
          // If only b is in recent agents, b comes first
          if (posB !== -1) return 1;
          // If neither is in recent agents, maintain original order
          return 0;
        }
        
        return totalSpentDiff;
      });
      
      return agentsSortedByEarnings;
    };
    
    const sortedAgents = sortAgentsByEarningsAndRecentUsage();
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
          <Plus className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No agents yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first AI agent to start building custom assistants for your needs.
        </p>
        <Button asChild size="lg">
          <Link href="/agents/create">Create Your First Agent</Link>
        </Button>
      </div>
    );
  }

  // Get display text for current time period
  const getTimePeriodDisplay = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toLocaleString('default', { month: 'long' });
    const previousMonthYear = new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear();
    
    switch (timePeriod) {
      case 'current-month':
        return `${currentMonth} ${currentYear}`;
      case 'previous-month':
        return `${previousMonth} ${previousMonthYear}`;
      default:
        return 'All Time';
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
        <div className="flex gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search my agents..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Select
              value={timePeriod}
              onValueChange={handleTimePeriodChange}
            >
              <SelectTrigger className="w-[220px]">
                <CalendarIcon className="mr-2 size-4" />
                <span>Earnings: {getTimePeriodDisplay()}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time Earnings</SelectItem>
                <SelectItem value="current-month">This Month ({new Date().toLocaleString('default', { month: 'long' })})</SelectItem>
                <SelectItem value="previous-month">Last Month ({new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString('default', { month: 'long' })})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button asChild>
          <Link href="/agents/create">
            <Plus className="mr-2 size-4" />
            Create New Agent
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 justify-items-center">
        {filteredAgents.map((agent) => (
          <MyAgentCard 
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