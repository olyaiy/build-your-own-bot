'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import React, { memo, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { ExtendedChat as Chat } from '@/lib/db/schema';
import { cn, fetcher } from '@/lib/utils';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { GlobeIcon, MoreHorizontalIcon, ShareIcon, CheckCircleFillIcon, LockIcon, TrashIcon, CopyIcon } from '../util/icons';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onDuplicate,
  setOpenMobile,
  onItemClick,
  isLoading,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onDuplicate: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
  onItemClick: (chatId: string) => void;
  isLoading?: boolean;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibility: chat.visibility,
  });

  // Check if this is an optimistic chat (being created)
  const isOptimisticChat = chat.id.startsWith('optimistic-');

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={isActive} 
        className={cn(
          "transition-all duration-100 relative py-1.5",
          {
            'bg-accent border-l-4 border-primary rounded-l-sm': isActive,
          }
        )}
      >
        <Link 
          href={isOptimisticChat ? '#' : `/${chat.agentId}/${chat.id}`}
          onClick={(e) => {
            if (isOptimisticChat) {
              // Prevent navigation for optimistic chats
              e.preventDefault();
            }
            // Set this chat as optimistically active
            onItemClick(chat.id);
            setOpenMobile(false);
          }}
        >
          <div className="flex flex-col gap-0.5 items-start w-full">
            <span className={cn(
              "text-sm truncate w-full transition-colors duration-150", 
              {
                "font-semibold text-primary": isActive,
                "font-medium": !isActive,
                "opacity-70": isOptimisticChat
              }
            )}>
              {chat.title}
              {isOptimisticChat && " (creating...)"}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full opacity-80">
              {chat.agentDisplayName}
            </span>
          </div>
        </Link>
      </SidebarMenuButton>

      {!isOptimisticChat && (
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
              showOnHover={!isActive}
            >
              <MoreHorizontalIcon size={14} />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <ShareIcon size={14} />
                <span>Share</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    className="cursor-pointer flex-row justify-between"
                    onClick={() => {
                      setVisibilityType('private');
                    }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <LockIcon size={12} />
                      <span>Private</span>
                    </div>
                    {visibilityType === 'private' ? (
                      <CheckCircleFillIcon />
                    ) : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer flex-row justify-between"
                    onClick={() => {
                      setVisibilityType('public');
                    }}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <GlobeIcon />
                      <span>Public</span>
                    </div>
                    {visibilityType === 'public' ? <CheckCircleFillIcon /> : null}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => onDuplicate(chat.id)}
            >
              <CopyIcon size={14} />
              <span>Duplicate</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon size={14} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.chat.id !== nextProps.chat.id) return false;
  return true;
});

export function SidebarHistory({ 
  user,
  currentConversationId
}: { 
  user: User | undefined | null,
  currentConversationId?: string 
}) {
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const chatIdFromUrl = params?.['chat-id'] as string | undefined;
  const pathname = usePathname();
  
  const [optimisticActiveId, setOptimisticActiveId] = useState<string | undefined>(undefined);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [optimisticChats, setOptimisticChats] = useState<Chat[]>([]);
  const router = useRouter();
  
  const isOptimisticState = optimisticActiveId !== undefined && optimisticActiveId !== chatIdFromUrl;
  
  const activeId = optimisticActiveId || chatIdFromUrl || currentConversationId;
  
  useEffect(() => {
    setOptimisticActiveId(undefined);
    setOptimisticChats([]);
  }, [chatIdFromUrl, pathname]);
  
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const combinedHistory = useMemo(() => {
    if (!history) return optimisticChats;
    const filteredOptimisticChats = optimisticChats.filter(
      (oc) => !history.some((c) => c.id === oc.id)
    );
    return [...history, ...filteredOptimisticChats];
  }, [history, optimisticChats]);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== deleteId);
          }
        });
        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setShowDeleteDialog(false);

    if (deleteId === activeId) {
      router.push('/');
    }
  };

  const handleDuplicate = async (chatId: string) => {
    try {
      setIsDuplicating(true);
      
      // Find the original chat to duplicate
      const originalChat = history?.find(chat => chat.id === chatId);
      if (!originalChat) {
        throw new Error('Original chat not found');
      }
      
      // Create an optimistic temporary ID for the new chat
      const optimisticId = `optimistic-${Date.now()}`;
      
      // Create an optimistic chat and add it to state
      const optimisticChat: Chat = {
        id: optimisticId,
        createdAt: new Date(),
        title: `${originalChat.title} (copy)`,
        userId: originalChat.userId,
        agentId: originalChat.agentId,
        visibility: originalChat.visibility,
        // Copy additional properties for display
        agentDisplayName: originalChat.agentDisplayName,
      };
      
      // Add the optimistic chat to our state
      setOptimisticChats(prev => [...prev, optimisticChat]);
      
      // Set this as the active chat
      setOptimisticActiveId(optimisticId);
      
      // Make the actual API request
      const response = await fetch('/api/chats/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate chat');
      }
      
      const { newChatId, agentId } = await response.json();
      
      // Remove the optimistic chat
      setOptimisticChats(prev => prev.filter(chat => chat.id !== optimisticId));
      
      toast.success('Chat duplicated successfully');
      
      // Navigate to the real chat
      router.push(`/${agentId}/${newChatId}`);
      
      // Refresh data
      mutate();
    } catch (error) {
      toast.error('Failed to duplicate chat. Please try again.');
      console.error('Error duplicating chat:', error);
      
      // Remove all optimistic chats on error
      setOptimisticChats(prev => prev.filter(chat => !chat.id.startsWith('optimistic-')));
      setOptimisticActiveId(undefined);
    } finally {
      setIsDuplicating(false);
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-3 py-2 text-muted-foreground w-full flex flex-row justify-center items-center text-xs text-center">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading && !combinedHistory.length) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col space-y-1.5 p-1">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-7 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-3.5 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10 animate-pulse"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (combinedHistory.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-3 py-2 text-muted-foreground w-full flex flex-row justify-center items-center text-xs text-center">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);

        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats,
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {combinedHistory &&
              (() => {
                const groupedChats = groupChatsByDate(combinedHistory);

                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60">
                          Today
                        </div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === activeId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onDuplicate={handleDuplicate}
                            setOpenMobile={setOpenMobile}
                            onItemClick={(chatId) => {
                              setOptimisticActiveId(chatId);
                            }}
                            isLoading={isOptimisticState}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60 mt-4">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === activeId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onDuplicate={handleDuplicate}
                            setOpenMobile={setOpenMobile}
                            onItemClick={(chatId) => {
                              setOptimisticActiveId(chatId);
                            }}
                            isLoading={isOptimisticState}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60 mt-4">
                          Last 7 days
                        </div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === activeId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onDuplicate={handleDuplicate}
                            setOpenMobile={setOpenMobile}
                            onItemClick={(chatId) => {
                              setOptimisticActiveId(chatId);
                            }}
                            isLoading={isOptimisticState}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60 mt-4">
                          Last 30 days
                        </div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === activeId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onDuplicate={handleDuplicate}
                            setOpenMobile={setOpenMobile}
                            onItemClick={(chatId) => {
                              setOptimisticActiveId(chatId);
                            }}
                            isLoading={isOptimisticState}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.older.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60 mt-4">
                          Older
                        </div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === activeId}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onDuplicate={handleDuplicate}
                            setOpenMobile={setOpenMobile}
                            onItemClick={(chatId) => {
                              setOptimisticActiveId(chatId);
                            }}
                            isLoading={isOptimisticState}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
