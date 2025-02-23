import { Card } from "@/components/ui/card";
import Link from 'next/link';
import type { Agent, Model } from "@/lib/db/schema";

interface AgentListProps {
  agents: (Agent & { model?: Model })[];
}

export function AgentList({ agents }: AgentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Link 
          key={agent.id} 
          href={`/${agent.id}`}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">{agent.agent_display_name}</h3>
            <p className="text-muted-foreground mb-2 line-clamp-3">
              {agent.description}
            </p>
            {agent.model?.model_display_name && (
              <div className="text-sm text-primary mb-2">
                Model: {agent.model.model_display_name}
              </div>
            )}
            {agent.visibility !== 'public' && (
              <div className="text-sm text-primary">
                Visibility: {agent.visibility}
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
} 