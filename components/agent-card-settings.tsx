"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface AgentCardSettingsProps {
  agentId: string;
  userId?: string;
  creatorId?: string | null;
}

export function AgentCardSettings({ agentId, userId, creatorId }: AgentCardSettingsProps) {
  const router = useRouter();

  return (
    <button
      className="p-1.5 hover:bg-accent rounded-md"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(
          userId === creatorId 
            ? `/agents/edit/${agentId}` 
            : `/agents/view/${agentId}`
        );
      }}
    >
      <Settings className="w-4 h-4" />
    </button>
  );
} 