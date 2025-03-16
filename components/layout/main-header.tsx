'use client';

import { memo } from 'react';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useSidebar } from '../ui/sidebar';
import { useWindowSize } from 'usehooks-ts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PureMainHeader() {
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 z-[999] justify-between">
      <div className="flex items-center gap-2">
        {(!open || windowWidth < 768) && <SidebarToggle />}
      </div>
      <div className="flex items-center gap-2">
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
    </header>
  );
}

export const MainHeader = memo(PureMainHeader, () => true);
