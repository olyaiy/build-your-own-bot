import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page(props: { 
  params: { 
    agent: string;
    'chat-id': string;
  } 
}) {
  const { agent, 'chat-id': chatId } = props.params;
  
  console.log('Agent ID:', agent);
  console.log('Chat ID:', chatId);

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  // if (chat.visibility === 'private') {
  //   if (!session || !session.user) {
  //     return notFound();
  //   }

  //   if (session.user.id !== chat.userId) {
  //     return notFound();
  //   }
  // }

  const messagesFromDb = await getMessagesByChatId({
    id: chatId,
  });

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');


  
  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chatId}
          agentId={agent}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
        />
        <DataStreamHandler id={chatId} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chatId}
        agentId={agent}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
