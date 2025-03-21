'use client';
import { ChevronUp, UserCircle, LogIn, UserPlus, User, ChevronDown, HelpCircle, MessageSquare, PlusCircle, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { User as AuthUser } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { User as DbUser } from '@/lib/db/schema';

interface UserNavProps {
  variant?: 'sidebar' | 'header';
  user?: AuthUser | null;
}

export function UserNav({ variant = 'sidebar', user }: UserNavProps) {
  const { setTheme, theme } = useTheme();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowSize();
  const isMobile = width < 768; // md breakpoint in Tailwind

  // Consolidated data fetching logic
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
          setDbUser(userData?.[0] || null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email]);

  const displayName = dbUser?.user_name || user?.email;

  if (isLoading && variant === 'header') {
    return (
      <Button variant="ghost" size="sm" className="size-8 p-0">
        <span className="size-6 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  if (!user) {
    return variant === 'header' ? (
      <div className="flex items-center gap-1">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Login
          </Button>
        </Link>
      </div>
    ) : (
      <SidebarMenu>
        <SidebarMenuItem className="p-3">
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="flex items-center justify-center bg-muted/50 rounded-full p-3">
              <User className="size-8 text-muted-foreground" />
            </div>
            
            <div className="text-center space-y-1 w-full">
              <p className="text-sm font-medium">Not signed in</p>
              <p className="text-xs text-muted-foreground">Sign in to access all features</p>
            </div>
            
            <Separator className="my-1" />
            
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button asChild variant="default" size="sm" className="w-full">
                <Link href="/login" className="flex items-center justify-center gap-1">
                  <LogIn className="size-3.5" />
                  <span>Login</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/register" className="flex items-center justify-center gap-1">
                  <UserPlus className="size-3.5" />
                  <span>Sign up</span>
                </Link>
              </Button>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'header' ? (
          <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 py-1" size="sm">
            {/* Header-specific trigger */}
            <div className="relative size-6 rounded-full overflow-hidden">
              <Image
                src={`https://avatar.vercel.sh/${user.email || 'anonymous'}`}
                alt={displayName ?? 'User Avatar'}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <span className="max-w-[100px] truncate hidden sm:inline-block text-sm font-normal">
              {displayName || 'Anonymous'}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
            {/* Sidebar-specific trigger */}
            <Image
              src={`https://avatar.vercel.sh/${user.email || 'anonymous'}`}
              alt={displayName ?? 'User Avatar'}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="truncate">{displayName || 'Anonymous'}</span>
            <ChevronUp className="ml-auto" />
          </SidebarMenuButton>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Common dropdown content */}
        <div className="flex items-center justify-start gap-2 p-2">
          <div className={`relative ${variant === 'header' ? 'size-8' : 'size-10'} rounded-full overflow-hidden`}>
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
        
        {/* Mobile-only header navigation items */}
        {isMobile && variant === 'header' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/agents/create" className="flex items-center cursor-pointer">
                <PlusCircle className="mr-2 size-4" />
                <span>Create</span>
              </Link>
            </DropdownMenuItem>
            
            {user && (
              <DropdownMenuItem asChild>
                <Link href="/profile/agents" className="flex items-center cursor-pointer">
                  <User className="mr-2 size-4" />
                  <span>My Agents</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem asChild>
              <Link href="/contact" className="flex items-center cursor-pointer">
                <MessageSquare className="mr-2 size-4" />
                <span>Support</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/about" className="flex items-center cursor-pointer">
                <Info className="mr-2 size-4" />
                <span>About</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/faq" className="flex items-center cursor-pointer">
                <HelpCircle className="mr-2 size-4" />
                <span>FAQ</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}
        
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
