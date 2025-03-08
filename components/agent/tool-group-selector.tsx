"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { 
  CheckIcon, 
  InfoIcon,
  SearchIcon,
  FilterIcon,
  Settings2Icon,
  WrenchIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

  const toggleToolGroup = (id: string) => {
    const isSelected = selectedToolGroupIds.includes(id);
    const newSelection = isSelected
      ? selectedToolGroupIds.filter((groupId) => groupId !== id)
      : [...selectedToolGroupIds, id];
    
    onChange(newSelection);
  };

  const toggleAllTools = () => {
    if (selectedToolGroupIds.length === toolGroups.length) {
      // If all are selected, deselect all
      onChange([]);
    } else {
      // Select all
      onChange(toolGroups.map(group => group.id));
    }
  };

  const filteredToolGroups = toolGroups.filter(group => 
    group.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={cn("space-y-4 border-t pt-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-5 text-muted-foreground" />
          <Label className="text-lg font-semibold">Tool Groups</Label>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant={selectedToolGroupIds.length > 0 ? "default" : "outline"} 
                  className="cursor-pointer transition-colors"
                  onClick={toggleAllTools}
                >
                  {selectedToolGroupIds.length} of {toolGroups.length} selected
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {selectedToolGroupIds.length === toolGroups.length ? "deselect" : "select"} all tools</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tool groups..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredToolGroups.length > 0 ? (
          filteredToolGroups.map((group) => {
            const isSelected = selectedToolGroupIds.includes(group.id);
            const isHovered = hoveredGroupId === group.id;
            
            return (
              <div
                key={group.id}
                onClick={() => toggleToolGroup(group.id)}
                onMouseEnter={() => setHoveredGroupId(group.id)}
                onMouseLeave={() => setHoveredGroupId(null)}
                className={cn(
                  "relative border rounded-lg p-4 cursor-pointer transition-all duration-200",
                  "flex flex-col justify-between h-28",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted hover:border-primary/50 hover:bg-muted/5"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="size-4 text-primary" />
                  </div>
                )}
                
                <div>
                  <div className="font-medium truncate pr-6">{group.displayName}</div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                
                {group.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "text-xs self-end transition-opacity",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}>
                          <InfoIcon className="size-3 inline mr-1" />
                          <span className="text-muted-foreground">More info</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        {group.description}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center p-6 border border-dashed rounded-lg text-muted-foreground">
            No tool groups match your search criteria
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {selectedToolGroupIds.length === 0
          ? "No tools selected. Your agent will have limited capabilities."
          : `${selectedToolGroupIds.length} Tool group${selectedToolGroupIds.length === 1 ? "" : "s"} selected for this agent.`}
      </p>
    </div>
  );
} 