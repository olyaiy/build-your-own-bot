'use client';

import { memo } from 'react';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useSidebar } from '../ui/sidebar';


function PureMainHeader() {
  const { open } = useSidebar();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 z-[999]">
      <SidebarToggle />
    </header>
  );
}

export const MainHeader = memo(PureMainHeader, () => true);
