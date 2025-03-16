'use client';

import { memo, useEffect, useState } from 'react';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useSidebar } from '../ui/sidebar';
import { useWindowSize } from 'usehooks-ts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useSession } from 'next-auth/react';
import { ChevronDown, Plus, User } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { UserNav } from './sidebar-user-nav';

function PureMainHeader() {
  const pathname = usePathname();
  
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { data: session } = useSession();

  // Hide header on chat pages (UUID routes)
  if (pathname && /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i.test(pathname)) {
    return null;
  }

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-3 gap-2 z-50 justify-between border-b ">
      <div className="flex items-center gap-2">
        {(!open || windowWidth < 768) && <SidebarToggle />}
        {!open && windowWidth >= 768 && <Logo />}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1">
          <Link href="/agents/create">
            <Button variant="ghost" size="sm" className="gap-1">
              Create
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" size="sm">
              FAQ
            </Button>
          </Link>
        </div>
        <UserNav variant="header" user={session?.user} />
      </div>
    </header>
  );
}

export const MainHeader = memo(PureMainHeader);
