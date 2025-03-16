'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AuthStatus() {
  const { data: session, status } = useSession();
  
  return (
    <div className="flex justify-end p-2 text-sm">
      {status === 'loading' ? (
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      ) : session ? (
        <p className="text-muted-foreground">
          Logged in as <span className="font-medium">{session.user?.email}</span>
        </p>
      ) : (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
} 