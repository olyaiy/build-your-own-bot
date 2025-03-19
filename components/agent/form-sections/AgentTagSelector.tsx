"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Tag, 
  Plus, 
  X, 
  Check,
  Info
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Tag interface for dropdown selection
interface TagInfo {
  id: string;
  name: string;
}

interface AgentTagSelectorProps {
  tags: TagInfo[];
  selectedTags: TagInfo[];
  newTagInput: string;
  tagPopoverOpen: boolean;
  setTagPopoverOpen: (open: boolean) => void;
  handleTagInputChange: (value: string) => void;
  handleAddNewTag: () => void;
  handleRemoveTag: (tagId: string) => void;
  handleSelectTag: (tag: TagInfo) => void;
}

export default function AgentTagSelector({
  tags,
  selectedTags,
  newTagInput,
  tagPopoverOpen,
  setTagPopoverOpen,
  handleTagInputChange,
  handleAddNewTag,
  handleRemoveTag,
  handleSelectTag,
}: AgentTagSelectorProps) {
  // Group tags by first letter for better organization
  const groupedTags = tags.reduce((acc, tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(tag);
    return acc;
  }, {} as Record<string, TagInfo[]>);

  // Sort group keys alphabetically
  const sortedGroups = Object.keys(groupedTags).sort();

  // Filter out already selected tags
  const availableTags = tags.filter(
    (tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Only create new tag if no matches exist
      const hasExactMatch = availableTags.some(
        tag => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
      );

      if (!hasExactMatch && newTagInput.trim() !== '') {
        handleAddNewTag();
      }
    }
  };

  return (
    <Card className="border border-muted-foreground/10 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Tag className="size-3.5 text-primary" />
          Agent Tags
        </CardTitle>
        <CardDescription className="text-xs">
          Categorize your agent for better discovery
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2">
        <div className="flex flex-wrap gap-1.5 min-h-8 p-1.5 border border-input rounded-md bg-background">
          {selectedTags.length === 0 ? (
            <p className="text-xs text-muted-foreground p-0.5">Add tags to categorize your agent</p>
          ) : (
            selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                className="px-1.5 py-0.5 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              >
                {tag.name}
                <button
                  className="ml-1 text-primary hover:text-primary/70 focus:outline-none"
                  onClick={() => handleRemoveTag(tag.id)}
                  title="Remove tag"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs gap-1 h-7"
              >
                <Plus className="size-3" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-64" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search or add a new tag..." 
                  value={newTagInput}
                  onValueChange={handleTagInputChange}
                  onKeyDown={handleKeyDown}
                />
                <CommandList>
                  <CommandEmpty className="py-2 px-4">
                    {newTagInput ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs">No matching tags found</p>
                        <Button 
                          size="sm" 
                          onClick={handleAddNewTag}
                          className="mt-1 w-full text-xs h-7"
                        >
                          <Plus className="size-3 mr-1" />
                          Create &quot;{newTagInput}&quot;
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs">Type to search or create tags</p>
                    )}
                  </CommandEmpty>
                  {availableTags.length > 0 && (
                    <ScrollArea className="max-h-48">
                      {sortedGroups.map((letter) => {
                        // Filter to only show groups that have available tags
                        const filteredTags = groupedTags[letter].filter(
                          (tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
                        );
                        
                        if (filteredTags.length === 0) return null;
                        
                        return (
                          <CommandGroup key={letter} heading={letter}>
                            {filteredTags.map((tag) => (
                              <CommandItem
                                key={tag.id}
                                value={tag.name}
                                onSelect={() => handleSelectTag(tag)}
                                className="flex items-center justify-between text-xs"
                              >
                                <span>{tag.name}</span>
                                <Check className="size-3 text-muted-foreground opacity-0 group-data-[selected]:opacity-100" />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        );
                      })}
                    </ScrollArea>
                  )}
                  {newTagInput.trim() !== "" && (
                    <div className="p-1 border-t">
                      <Button 
                        size="sm" 
                        onClick={handleAddNewTag}
                        className="w-full text-xs h-7"
                      >
                        <Plus className="size-3 mr-1" />
                        Add &quot;{newTagInput.trim()}&quot;
                      </Button>
                    </div>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Common tags suggestions - more compact display */}
        {availableTags.length > 0 && (
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground mb-1 inline-block">
              Suggested:
            </Label>
            <div className="flex flex-wrap gap-1">
              {availableTags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="px-1.5 py-0 text-xs cursor-pointer hover:bg-muted"
                  onClick={() => handleSelectTag(tag)}
                >
                  {tag.name}
                  <Plus className="ml-0.5 size-2 text-muted-foreground" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 