'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationButtonProps {
  direction: 'previous' | 'next';
  isDisabled: boolean;
  currentPage: number;
}

export function PaginationButton({
  direction,
  isDisabled,
  currentPage,
}: PaginationButtonProps) {
  const pageNumber = direction === 'next' ? currentPage + 1 : currentPage - 1;
  const Icon = direction === 'next' ? ChevronRight : ChevronLeft;
  
  if (isDisabled) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="size-8" 
        disabled
      >
        <Icon className="size-4" />
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "size-8 hover:bg-muted-foreground/10",
        direction === 'next' ? "rounded-r-md" : "rounded-l-md"
      )}
      asChild
    >
      <Link href={`/chats?page=${pageNumber}`}>
        <Icon className="size-4" />
      </Link>
    </Button>
  );
} 