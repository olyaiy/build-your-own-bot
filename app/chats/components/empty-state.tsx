import Link from 'next/link';
import { MessageIcon } from '@/components/util/icons';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-16 px-4 space-y-8 text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-primary/5 animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 shadow-sm">
            <MessageIcon size={38} />
          </div>
        </div>
        
        <div className="space-y-3 max-w-md">
          <h2 className="text-3xl font-bold tracking-tight">No conversations yet</h2>
          <p className="text-muted-foreground text-lg">
            You haven&apos;t started any conversations with our agents. Start chatting to see your history here.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button asChild size="lg" className="group">
          <Link href="/" className="flex items-center gap-2">
            Start a conversation
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/agents">Explore available agents</Link>
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        {[
          {
            title: 'Ask Questions',
            description: 'Get instant answers to your queries with our AI agents'
          },
          {
            title: 'Learn Together',
            description: 'Explore topics in depth through interactive conversations'
          },
          {
            title: 'Save Your Progress',
            description: 'Continue conversations later, exactly where you left off'
          }
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-lg border bg-card shadow-sm">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 