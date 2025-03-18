import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export function Logo({
  className,
  spanClassName,
}: {
  className?: string;
  spanClassName?: string;
}) {
  // const { setOpenMobile } = useSidebar();
  
  return (
    <Link
      href="/"
      // onClick={() => setOpenMobile(false)}
      className={cn(
        'flex flex-row gap-2 items-center',
        className
      )}
    >
      <span className={cn(
        'text-2xl font-semibold px-2 rounded-md cursor-pointer',
        spanClassName
      )}>
        Agent Vendor
      </span>
    </Link>
  );
} 