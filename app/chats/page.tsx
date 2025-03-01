import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getChatsByUserId } from '@/lib/db/queries';
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
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Get the current page from search params or default to 1
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const searchQuery = searchParams.search || '';
  
  // Make sure we have a user ID
  const userId = session.user.id;
  if (!userId) {
    redirect('/login');
  }
  
  // Fetch all chats - we'll handle pagination in the component
  // In a real-world app with many chats, you'd want to paginate at the database level
  const chats = await getChatsByUserId({ id: userId });
  
  if (!chats || chats.length === 0) {
    return <EmptyState />;
  }

  // Filter chats if search query exists
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.agentDisplayName && chat.agentDisplayName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chats;
  
  // Calculate pagination details
  const totalChats = filteredChats.length;
  const totalPages = Math.ceil(totalChats / CHATS_PER_PAGE);
  
  // Get the chats for the current page
  const startIndex = (page - 1) * CHATS_PER_PAGE;
  const paginatedChats = filteredChats.slice(startIndex, startIndex + CHATS_PER_PAGE);
  
  return (
    <div className="container max-w-6xl py-8 mx-auto ">
        <MainHeader />
      <div className="space-y-8 px-8 mt-2">
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
          />
        </div>
      </div>
    </div>
  );
}
