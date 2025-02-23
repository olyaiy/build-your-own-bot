"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function AgentCardSettings({ agentId }: { agentId: string }) {
  const router = useRouter();

  return (
    <button
      className="p-1.5 hover:bg-accent rounded-md"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/agents/edit/${agentId}`);
      }}
    >
      <Settings className="w-4 h-4" />
    </button>
  );
} 