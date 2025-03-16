'use client';

import { memo } from 'react';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useSidebar } from '../ui/sidebar';
import { useWindowSize } from 'usehooks-ts';

function PureMainHeader() {
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 z-[999]">
      {(!open || windowWidth < 768) && <SidebarToggle />}
    </header>
  );
}

export const MainHeader = memo(PureMainHeader, () => true);
