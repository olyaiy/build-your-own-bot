'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";

interface TagFiltersProps {
  tags: { id: string; name: string; count: number }[];
  onTagSelect: (tagId: string) => void;
  selectedTags: string[];
}

export function TagFilters({ tags, onTagSelect, selectedTags }: TagFiltersProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Initial display shows top 4 most common tags
  const initialTagsToShow = 4;
  const displayTags = showAllTags ? tags : tags.slice(0, initialTagsToShow);
  
  return (
    <div className="mb-6">      
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <Badge 
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-muted-foreground/20"
            onClick={() => onTagSelect(tag.id)}
          >
            {tag.name}
            <span className="ml-1 text-xs text-muted-foreground">
              ({tag.count})
            </span>
          </Badge>
        ))}
        
        {tags.length > initialTagsToShow && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1 h-6"
            onClick={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show more tags ({tags.length - initialTagsToShow})
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 