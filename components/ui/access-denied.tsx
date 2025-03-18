import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  actionHref?: string;
  actionText?: string;
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'Sorry, you don\'t have access to this resource.',
  actionHref = '/',
  actionText = 'Go Home'
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="mb-6">{message}</p>
      <Button asChild>
        <Link href={actionHref}>
          {actionText}
        </Link>
      </Button>
    </div>
  );
} 