'use client';

import { memo, useEffect, useState } from 'react';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useSidebar } from '../ui/sidebar';
import { useWindowSize } from 'usehooks-ts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useSession } from 'next-auth/react';
import { ChevronDown, User } from 'lucide-react';
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

// HeaderUserNav component
function HeaderUserNav() {
  const { data: session } = useSession();
  const user = session?.user;
  const { setTheme, theme } = useTheme();
  const [dbUser, setDbUser] = useState<{ user_name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.email) {
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        const response = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.length > 0) {
            setDbUser(userData[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user?.email]);

  // Display name with fallback to email
  const displayName = dbUser?.user_name || user?.email;

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
        <span className="w-6 h-6 rounded-full bg-muted animate-pulse"></span>
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 py-1" size="sm">
          <div className="relative w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={`https://avatar.vercel.sh/${user.email || 'anonymous'}`}
              alt={displayName ?? 'User Avatar'}
              fill
              className="object-cover"
            />
          </div>
          <span className="max-w-[100px] truncate hidden sm:inline-block text-sm font-normal">
            {displayName || 'Anonymous'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={`https://avatar.vercel.sh/${user.email || 'anonymous'}`}
              alt={displayName ?? 'User Avatar'}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none">{displayName || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 size-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => {
              signOut({
                redirectTo: '/',
              });
            }}
          >
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PureMainHeader() {
  const pathname = usePathname();
  
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  // Hide header on chat pages (UUID routes)
  if (pathname && /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i.test(pathname)) {
    return null;
  }

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-3 gap-2 z-50 justify-between border-b">
      <div className="flex items-center gap-2">
        {(!open || windowWidth < 768) && <SidebarToggle />}
        {!open && windowWidth >= 768 && <Logo />}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1">
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
        <HeaderUserNav />
      </div>
    </header>
  );
}

export const MainHeader = memo(PureMainHeader);
