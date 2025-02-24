import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import type { Agent, agents, Model, models } from "@/lib/db/schema";
import { Plus } from "lucide-react";
import { AgentCardSettings } from "./agent-card-settings";
import { InferSelectModel } from "drizzle-orm";

interface AgentListProps {
  agents: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    model?: InferSelectModel<typeof models> | null
  })[];
  userId?: string;
}

export function AgentList({ agents, userId }: AgentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Link key={agent.id} href={`/${agent.id}`}>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative group h-[270px] flex flex-col">
            {agent.visibility !== 'public' && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-muted">
                  {agent.visibility}
                </Badge>
              </div>
            )}
            
            <div className="h-28 mb-2 rounded-lg bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 relative">
              <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700 rounded-lg"></div>
            </div>

            <h3 className="text-lg font-semibold mb-2 line-clamp-1">{agent.agent_display_name}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-3 flex-1">
              {agent.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              {agent.model?.model_display_name && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                  {agent.model.model_display_name}
                </Badge>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <AgentCardSettings 
                  agentId={agent.id}
                  userId={userId}
                  creatorId={agent.creatorId}
                />
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