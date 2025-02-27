"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";

export type ToolGroupInfo = {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
};

interface ToolGroupSelectorProps {
  toolGroups: ToolGroupInfo[];
  selectedToolGroupIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function ToolGroupSelector({
  toolGroups,
  selectedToolGroupIds,
  onChange,
  className,
}: ToolGroupSelectorProps) {
  const toggleToolGroup = (id: string) => {
    const isSelected = selectedToolGroupIds.includes(id);
    const newSelection = isSelected
      ? selectedToolGroupIds.filter((groupId) => groupId !== id)
      : [...selectedToolGroupIds, id];
    
    onChange(newSelection);
  };

  return (
    <div className={className}>
      <Label className="text-lg font-semibold">Tools</Label>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {toolGroups.map((group) => {
          const isSelected = selectedToolGroupIds.includes(group.id);
          return (
            <div
              key={group.id}
              onClick={() => toggleToolGroup(group.id)}
              className={cn(
                "relative border rounded-lg p-3 cursor-pointer transition-all duration-200 h-24 flex flex-col",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-muted-foreground/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckIcon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="font-medium truncate">{group.displayName}</div>
              {group.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {group.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        {selectedToolGroupIds.length === 0
          ? "No tool groups selected"
          : `${selectedToolGroupIds.length} tool group${selectedToolGroupIds.length === 1 ? "" : "s"} selected`}
      </p>
    </div>
  );
} 