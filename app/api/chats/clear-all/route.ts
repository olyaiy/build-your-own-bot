import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId, deleteChatById } from '@/lib/db/queries';

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    if (!userId) {
      return new NextResponse('User ID not found', { status: 400 });
    }
    
    // Get all chats for this user
    const userChats = await getChatsByUserId({ id: userId });
    
    // Delete each chat
    if (userChats && userChats.length > 0) {
      await Promise.all(userChats.map(chat => deleteChatById({ id: chat.id })));
    }
    
    return NextResponse.json({ 
      success: true, 
      count: userChats?.length || 0 
    });
  } catch (error) {
    console.error('[CLEAR_ALL_CHATS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 