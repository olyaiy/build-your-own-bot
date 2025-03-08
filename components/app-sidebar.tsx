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

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const pathname = usePathname();
  const agentId = params.agent ?? 'fb4a1d96-bd42-46cb-a153-4aac537f3720';
  const chatId = params['chat-id'] as string | undefined;
  const isHistoryPage = pathname === '/chats';

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-2 items-center"
            >
              <span className="text-base font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Agent Place
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push(`/${agentId}`);
                    router.refresh();
                  }}
                >
                  <PlusIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
        
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full flex items-center justify-start gap-2 h-8 px-2 text-sm",
                  isHistoryPage && "bg-muted border-primary/50 text-primary"
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
      </SidebarHeader>
      <SidebarContent className="custom-sidebar-scrollbar">
        <SidebarHistory user={user} currentConversationId={chatId} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
