import { getMessagesByChatId } from "@/lib/db/queries";

// app/api/chat/messages/route.ts
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    
    if (!chatId) return new Response('Missing chatId', { status: 400 });
    
    const messages = await getMessagesByChatId({ id: chatId });
    return Response.json(messages);
  }