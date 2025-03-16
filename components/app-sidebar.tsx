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
import { SidebarUserNav } from './layout/sidebar-user-nav';
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';
import { SidebarToggle } from './layout/sidebar-toggle';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const pathname = usePathname();
  const agentId = params.agent ?? 'fb4a1d96-bd42-46cb-a153-4aac537f3720';
  const chatId = params['chat-id'] as string | undefined;
  const isHistoryPage = pathname === '/chats';

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
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <div className="absolute top-2 right-2 aspect-square">
            <SidebarToggle />
          </div>
          <div className="flex  my-2 flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-2 items-center"
            >
              <span className="text-2xl font-semibold px-2  rounded-md cursor-pointer">
                Agent Place
              </span>
            </Link>
          </div>
          <Separator className="my-2 bg-primary/10   h-[1px] rounded-full" />
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
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
