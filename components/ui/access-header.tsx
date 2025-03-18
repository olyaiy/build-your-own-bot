'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { PlusCircle, User, HelpCircle, MessageSquare, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserNav } from '../layout/sidebar-user-nav';

export function AccessHeader() {
  const { data: session } = useSession();
  
  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-3 gap-2 z-50 justify-between border-b">
      <div className="flex items-center gap-2">
        <Logo />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1">
          <Link href="/agents/create">
            <Button variant="ghost" size="sm" className="gap-1">
              <PlusCircle className="size-4 mr-1" />
              Create
            </Button>
          </Link>
          {session?.user && (
            <Link href="/profile/agents">
              <Button variant="ghost" size="sm">
                <User className="size-4 mr-1" />
                My Agents
              </Button>
            </Link>
          )}
          <Link href="/contact">
            <Button variant="ghost" size="sm">
              <MessageSquare className="size-4 mr-1" />
              Support
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm">
              <Info className="size-4 mr-1" />
              About
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" size="sm">
              <HelpCircle className="size-4 mr-1" />
              FAQ
            </Button>
          </Link>
        </div>
        <UserNav variant="header" user={session?.user} />
      </div>
    </header>
  );
} 