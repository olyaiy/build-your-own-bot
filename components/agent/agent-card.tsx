'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import Link from 'next/link';
import { InferSelectModel } from "drizzle-orm";
import { agents, models } from "@/lib/db/schema";
import { AgentCardSettings } from "./agent-card-settings";

interface AgentCardProps {
  agent: Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null;
    toolGroups?: { id: string; name: string; display_name: string; description: string | null }[] | null;
  };
  userId?: string;
  onClick?: (agentId: string) => void;
}

export function AgentCard({ agent, userId, onClick }: AgentCardProps) {
  const handleClick = () => {
    if (onClick) onClick(agent.id);
  };

  return (
    <div className="w-full">
      <Link href={`/${agent.id}`} onClick={handleClick}>
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative group h-[270px] min-w-[240px] max-w-[400px] w-full mx-auto flex flex-col">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700 rounded-lg"></div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{agent.agent_display_name}</h3>
      
          <div className="flex flex-col gap-1 mt-auto ">

            { agent.description && (
              <p className="text-xs text-muted-foreground mb-1 line-clamp-2 flex-1">
                {agent.description}
              </p>
            )}

            {/* Models display */}
            {agent.models && agent.models.length > 0 && (
              <div className="flex items-center gap-1 max-w-full overflow-hidden ">
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
                <div className="text-xs text-muted-foreground mr-1 ">Tools:</div>
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
            

              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <AgentCardSettings 
                  agentId={agent.id}
                  userId={userId}
                  creatorId={agent.creatorId}
                />

            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
} 