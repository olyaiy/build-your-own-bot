import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getChatsByUserId, searchChatsByContent } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import EmptyState from './components/empty-state';
import ChatHistoryView from './components/chat-history-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ClearAllChatsButton } from './components/clear-all-chats-button';
import { MainHeader } from '@/components/layout/main-header';


export const metadata: Metadata = {
  title: 'Chat History',
  description: 'View your past conversations',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default number of chats per page
const CHATS_PER_PAGE = 10;

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Await the searchParams Promise before accessing its properties
  const resolvedParams = await searchParams;
  
  // Get the current page from search params or default to 1
  const pageParam = resolvedParams?.page;
  const page = pageParam ? parseInt(pageParam) : 1;
  const searchQuery = resolvedParams?.search || '';
  
  // Make sure we have a user ID
  const userId = session.user.id;
  if (!userId) {
    redirect('/login');
  }
  
  // Fetch chats with or without search
  let chats;
  if (searchQuery.trim()) {
    // Use the content search for non-empty search queries
    chats = await searchChatsByContent({ userId, searchTerm: searchQuery });
  } else {
    // Get all chats without searching
    chats = await getChatsByUserId({ id: userId });
  }
  
  if (!chats || chats.length === 0) {
    return <EmptyState />;
  }

  // If searching, we don't paginate the results
  const totalChats = chats.length;
  
  let paginatedChats;
  let totalPages = 1;
  
  if (searchQuery.trim()) {
    // For search results, we don't paginate
    paginatedChats = chats;
    totalPages = 1;
  } else {
    // Calculate pagination details
    totalPages = Math.ceil(totalChats / CHATS_PER_PAGE);
    
    // Get the chats for the current page
    const startIndex = (page - 1) * CHATS_PER_PAGE;
    paginatedChats = chats.slice(startIndex, startIndex + CHATS_PER_PAGE);
  }
  
  return (
    <>
    <MainHeader />
    <div className="container max-w-6xl py-2 mx-auto ">
      <div className="space-y-8 px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Chat History</h1>
            <p className="text-muted-foreground mt-1">Browse and continue your past conversations</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <form className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                name="search"
                placeholder="Search conversations..."
                className="pl-8 w-full md:w-[250px] h-9"
                defaultValue={searchQuery}
              />
            </form>
            <div className="flex items-center gap-3">
              <ClearAllChatsButton />
              <Button asChild className="hidden md:flex">
                <a href="/">New Conversation</a>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-1">
          <ChatHistoryView 
            chats={paginatedChats} 
            currentPage={page} 
            totalPages={totalPages} 
            totalChats={totalChats}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
    </>
  );
}
