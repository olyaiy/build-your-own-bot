'use client';

import type { User } from 'next-auth';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { HistoryIcon, PlusIcon } from 'lucide-react';
import { SidebarHistory } from './layout/sidebar-history';

import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';
import { SidebarToggle } from './layout/sidebar-toggle';
import useSWR from 'swr';
import { Logo } from './logo';
import { UserNav } from './layout/sidebar-user-nav';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AppSidebar({ user: initialUser }: { user: User | undefined | null }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const pathname = usePathname();
  const agentId = params.agent ?? 'fb4a1d96-bd42-46cb-a153-4aac537f3720';
  const chatId = params['chat-id'] as string | undefined;
  const isHistoryPage = pathname === '/chats';

  // Use SWR to fetch and keep user data updated
  const { data: userData } = useSWR<User | null>('/api/user', fetcher, {
    fallbackData: initialUser || null,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // Use the SWR data or fall back to the initial user prop
  const user = userData || initialUser;

  // Function to handle the new chat button click
  const handleNewChatClick = () => {
    setOpenMobile(false);
    
    // Check if we're on an agent edit page
    if (pathname.includes('/agents/') && pathname.includes('/edit')) {
      // Extract the agent-id from the URL
      const agentIdMatch = pathname.match(/\/agents\/([^\/]+)\/edit/);
      if (agentIdMatch && agentIdMatch[1]) {
        // Navigate to the chat page with the extracted agent ID
        router.push(`/${agentIdMatch[1]}`);
      } else {
        // Fallback to the current agentId from params
        router.push(`/${agentId}`);
      }
    } else {
      // Default behavior - use the agentId from params
      router.push(`/${agentId}`);
    }
    
    router.refresh();
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="p-2 my-2">
        <SidebarMenu>
          <div className="absolute top-4 right-2 aspect-square">
            <SidebarToggle />
          </div>
          <div className="flex my-0 flex-row justify-between items-center">
            <Logo />
          </div>
          <Separator className="my-1 bg-primary/10   h-px rounded-full" />
        </SidebarMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              className={cn(
                "w-full flex items-center justify-start gap-2 h-10 px-2 text-sm",
                isHistoryPage && "bg-muted border-primary/50 text-primary"
              )}
              onClick={handleNewChatClick}
            > New Chat
              <PlusIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent align="end">New Chat</TooltipContent>
        </Tooltip>
        
        
      </SidebarHeader>
      <SidebarContent className="custom-sidebar-scrollbar">
        <SidebarHistory user={user} currentConversationId={chatId} />
        {user && (
          <div className="px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center justify-start gap-2 h-8 px-2 text-sm ",
                    isHistoryPage && "bg-background border-primary/50 text-primary hover:bg-muted"
                  )}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/chats');
                  }}
                >
                  <HistoryIcon size={14} />
                  <span>View Chat History</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">All Conversations</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter><UserNav variant="sidebar" user={user} /></SidebarFooter>
    </Sidebar>
  );
}
