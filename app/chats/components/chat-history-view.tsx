'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ExtendedChat } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GlobeIcon, LockIcon, MessageSquare as MessageIcon, Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple pagination button component
interface PaginationButtonProps {
  direction: 'previous' | 'next';
  isDisabled: boolean;
  currentPage: number;
}

function PaginationButton({ direction, isDisabled, currentPage }: PaginationButtonProps) {
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

// Extended type for chat with search results
interface SearchResultChat extends ExtendedChat {
  matchCount?: number;
  matchSnippets?: Array<{ text: string; messageId: string }>;
}

interface ChatHistoryViewProps {
  chats: SearchResultChat[];
  currentPage: number;
  totalPages: number;
  totalChats: number;
  searchQuery?: string;
}

// Function to highlight the search term in a text snippet
function HighlightText({ text, searchTerm }: { text: string; searchTerm: string }) {
  if (!searchTerm) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() 
          ? <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">{part}</mark> 
          : part
      )}
    </>
  );
}

export default function ChatHistoryView({
  chats,
  currentPage,
  totalPages,
  totalChats,
  searchQuery = '',
}: ChatHistoryViewProps) {
  const router = useRouter();

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  const isSearchResult = searchQuery && chats.some(chat => chat.matchCount && chat.matchCount > 0);

  // Group chats by date (same day)
  const groupChatsByDate = (chats: SearchResultChat[]) => {
    const groups: Record<string, SearchResultChat[]> = {};
    
    chats.forEach((chat) => {
      const date = new Date(chat.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(chat);
    });
    
    return Object.entries(groups).map(([date, chats]) => ({
      date,
      formattedDate: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      chats,
    }));
  };

  const groupedChats = isSearchResult 
    ? [{ date: 'search-results', formattedDate: 'Search Results', chats }] 
    : groupChatsByDate(chats);

  return (
    <div className="space-y-6">
      {totalChats > 0 && (
        <div className="flex justify-between items-center px-4 pt-3">
          <p className="text-sm text-muted-foreground">
            {isSearchResult 
              ? `Found ${totalChats} conversation${totalChats !== 1 ? 's' : ''} matching "${searchQuery}"` 
              : `Showing ${chats.length} of ${totalChats} conversations`}
          </p>
          
          {!isSearchResult && totalPages > 1 && (
            <div className="flex space-x-2">
              <PaginationButton
                direction="previous"
                isDisabled={currentPage <= 1}
                currentPage={currentPage}
              />
              <div className="flex items-center justify-center px-2">
                <span className="text-xs font-medium">
                  {currentPage} / {totalPages}
                </span>
              </div>
              <PaginationButton
                direction="next"
                isDisabled={currentPage >= totalPages}
                currentPage={currentPage}
              />
            </div>
          )}
        </div>
      )}

      {groupedChats.map(({ date, formattedDate, chats }) => (
        <div key={date} className="space-y-4 px-4">
          <h2 className="text-lg font-semibold text-muted-foreground flex items-center space-x-2 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
            <span className="text-primary">{formattedDate}</span>
            <div className="h-px flex-1 bg-border"></div>
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat) => (
              <Card 
                key={chat.id} 
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  "flex flex-col group relative isolate",
                  "bg-card/40 border-border/60",
                  "shadow-sm hover:shadow-lg",
                  "before:absolute before:inset-0 before:-z-10 before:transition-opacity before:opacity-0",
                  "before:bg-gradient-to-b before:from-primary/5 before:to-muted/20",
                  "hover:before:opacity-100 hover:border-primary/30",
                  chat.matchCount && chat.matchCount > 0 
                    ? "ring-1 ring-yellow-300/50 bg-yellow-50/5" 
                    : "ring-1 ring-border/60 hover:ring-primary/20"
                )}
              >
                <Link href={`/${chat.agentId}/${chat.id}`} className="flex-1 flex flex-col h-full">
                  <CardHeader className="p-4 pb-2 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-semibold tracking-tight line-clamp-1">
                        {chat.title}
                        {chat.matchCount && chat.matchCount > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                            {chat.matchCount} match{chat.matchCount !== 1 ? 'es' : ''}
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge 
                        variant={chat.visibility === 'public' ? 'secondary' : 'outline'}
                        className={cn(
                          "shrink-0 transition-colors",
                          chat.visibility === 'public' 
                            ? "bg-primary/10 text-primary hover:bg-primary/20" 
                            : "hover:bg-muted"
                        )}
                      >
                        {chat.visibility === 'public' ? (
                          <div className="flex items-center gap-1.5">
                            <GlobeIcon className="size-3.5" />
                            <span>Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <LockIcon className="size-3.5" />
                            <span>Private</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground/80">{chat.agentDisplayName || 'Unknown Agent'}</span>
                      <span className="size-1 rounded-full bg-muted-foreground/20" />
                      <span className="text-xs text-muted-foreground">{formatDate(chat.createdAt)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex-1">
                    {chat.matchSnippets && chat.matchSnippets.length > 0 ? (
                      <div className="space-y-2.5">
                        {chat.matchSnippets.map((snippet, i) => (
                          <div 
                            key={i} 
                            className="relative bg-muted/50 p-2.5 rounded-lg overflow-hidden group/snippet
                                     hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 text-xs mb-1.5">
                              <SearchIcon className="size-3.5 text-primary" />
                              <span className="font-medium text-primary">Match {i + 1}</span>
                            </div>
                            <p className="text-sm line-clamp-2 leading-relaxed">
                              <HighlightText text={snippet.text} searchTerm={searchQuery} />
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageIcon className="size-4" />
                        <span className="truncate">Start or continue your conversation</span>
                      </div>
                    )}
                  </CardContent>
                </Link>
                <CardFooter className="p-4 pt-3 border-t bg-muted/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full font-medium transition-colors
                             hover:bg-primary hover:text-primary-foreground
                             group-hover:bg-primary/90 group-hover:text-primary-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/${chat.agentId}/${chat.id}`);
                    }}
                  >
                    Continue conversation
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {!isSearchResult && totalPages > 1 && (
        <div className="flex justify-center pt-6 pb-2 border-t">
          <div className="flex space-x-4 items-center">
            <PaginationButton
              direction="previous"
              isDisabled={currentPage <= 1}
              currentPage={currentPage}
            />
            <div className="flex items-center justify-center px-2">
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <PaginationButton
              direction="next"
              isDisabled={currentPage >= totalPages}
              currentPage={currentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
} 