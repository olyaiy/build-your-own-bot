import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId, getAgentBySlug } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page(props: { 
  params: Promise<{ 
    agent: string;
    'chat-id': string;
  }>
}) {
  const { agent: agentSlug, 'chat-id': chatId } = await props.params;
  
  console.log('Agent Slug:', agentSlug);
  console.log('Chat ID:', chatId);

  const agent = await getAgentBySlug(agentSlug);
  if (!agent) {
    return notFound();
  }


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

  console.log('Chat ID IN EXISTING CHAT PAGE THSIS IS ITTTTT:', chatId);
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
          agentId={agent.id}
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
        agentId={agent.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
