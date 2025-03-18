"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateAgentButton() {
  const router = useRouter();

  const handleClick = () => {
    // Use window.location to navigate to the absolute URL
    window.location.href = `${window.location.origin}/agents/create`;
  };

  return (
    <Button 
      onClick={handleClick}
      className="flex items-center gap-2"
    >
      <PlusCircle className="h-4 w-4" />
      Create Agent
    </Button>
  );
} 