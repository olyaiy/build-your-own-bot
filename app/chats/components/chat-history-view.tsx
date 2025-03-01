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
import { PaginationButton } from './pagination-button';
import { GlobeIcon, LockIcon, MessageIcon } from '@/components/util/icons';
import { cn } from '@/lib/utils';

interface ChatHistoryViewProps {
  chats: ExtendedChat[];
  currentPage: number;
  totalPages: number;
  totalChats: number;
}

export default function ChatHistoryView({
  chats,
  currentPage,
  totalPages,
  totalChats,
}: ChatHistoryViewProps) {
  const router = useRouter();

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  // Group chats by date (same day)
  const groupChatsByDate = (chats: ExtendedChat[]) => {
    const groups: Record<string, ExtendedChat[]> = {};
    
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

  const groupedChats = groupChatsByDate(chats);

  return (
    <div className="space-y-6">
      {totalChats > 0 && (
        <div className="flex justify-between items-center px-4 pt-3">
          <p className="text-sm text-muted-foreground">
            Showing {chats.length} of {totalChats} conversations
          </p>
          
          {totalPages > 1 && (
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
                  "overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50",
                  "flex flex-col group"
                )}
              >
                <Link href={`/${chat.agentId}/${chat.id}`} className="flex-1 flex flex-col h-full">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-1">{chat.title}</CardTitle>
                      <Badge 
                        variant={chat.visibility === 'public' ? 'secondary' : 'outline'}
                        className="shrink-0"
                      >
                        {chat.visibility === 'public' ? (
                          <div className="flex items-center space-x-1">
                            <GlobeIcon size={12} />
                            <span>Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <LockIcon size={12} />
                            <span>Private</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-1 mt-1 text-sm">
                      <span className="font-medium">{chat.agentDisplayName || 'Unknown Agent'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageIcon size={12} />
                      <span className="ml-1.5 truncate">{formatDate(chat.createdAt)}</span>
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="p-4 pt-1 border-t bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
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

      {totalPages > 1 && (
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