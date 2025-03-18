import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AccessHeader } from '@/components/ui/access-header';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  actionHref?: string;
  actionText?: string;
  showHeader?: boolean;
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'Sorry, you don\'t have access to this resource.',
  actionHref = '/',
  actionText = 'Go Home',
  showHeader = false
}: AccessDeniedProps) {
  return (
    <>
      {showHeader && <AccessHeader />}
      <div className={`flex flex-col items-center justify-center p-4 text-center ${showHeader ? 'h-[calc(100vh-60px)]' : 'min-h-screen'}`}>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6">{message}</p>
        <Button asChild>
          <Link href={actionHref}>
            {actionText}
          </Link>
        </Button>
      </div>
    </>
  );
} 