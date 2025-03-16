'use client';
import { ChevronUp, UserCircle, LogIn, UserPlus, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { User as AuthUser } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

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

export function SidebarUserNav({ user }: { user: AuthUser | null | undefined }) {
  const { setTheme, theme } = useTheme();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.email) return;
        
        const response = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.length > 0) {
            setDbUser(userData[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (user?.email) {
      fetchUserData();
    }
  }, [user?.email]);

  // Display name with fallback to email
  const displayName = dbUser?.user_name || user?.email;

  // If no user is authenticated, show login/register buttons
  if (!user) {
    return (
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user?.email || 'anonymous'}`}
                alt={displayName ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{displayName || 'Anonymous'}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer">
                <UserCircle className="mr-2 size-4" />
                <span>View Profile</span>
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
