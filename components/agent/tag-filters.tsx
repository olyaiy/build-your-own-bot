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
  
  // Initial display shows top 4 most common tags, but only 3 on smaller screens
  const initialTagsToShow = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 4;
  const displayTags = showAllTags ? tags : tags.slice(0, initialTagsToShow);
  
  return (
    <div className="mb-2 md:mb-6">      
      <div className="flex flex-wrap gap-1 md:gap-2">
        {displayTags.map((tag) => (
          <Badge 
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-muted-foreground/20 text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1"
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
            className="text-xs flex items-center gap-1 h-6 px-2 md:px-3"
            onClick={() => setShowAllTags(!showAllTags)}
          >
            {showAllTags ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span className="hidden xs:inline">Show less</span>
                <span className="xs:hidden">Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span className="hidden xs:inline">Show more tags ({tags.length - initialTagsToShow})</span>
                <span className="xs:hidden">More ({tags.length - initialTagsToShow})</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 