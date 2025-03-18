'use client';

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from 'next/link';

export function CreateAgentCard() {
  return (
    <div className="w-full border rounded-lg aspect-square">
      <Link href="/agents/create">
        <Card className="size-full min-w-[180px] max-w-[400px] mx-auto flex items-center justify-center p-2 sm:p-4 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-muted p-3 sm:p-4 mb-2 transition-transform group-hover:scale-110">
              <Plus className="size-6 sm:size-8" />
            </div>
            <p className="text-sm font-medium">Create New Agent</p>
          </div>
        </Card>
      </Link>
    </div>
  );
} 