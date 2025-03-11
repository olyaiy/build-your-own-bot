'use client';

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from 'next/link';

export function CreateAgentCard() {
  return (
    <div className="w-full">
      <Link href="/agents/create">
        <Card className="h-full min-w-[240px] max-w-[400px] w-full mx-auto flex items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-muted p-4 mb-2 transition-transform group-hover:scale-110">
              <Plus className="size-8" />
            </div>
            <p className="text-sm font-medium">Create New Agent</p>
          </div>
        </Card>
      </Link>
    </div>
  );
} 