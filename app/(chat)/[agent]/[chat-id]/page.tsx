import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId, getAgentById, getModelById } from '@/lib/db/queries';
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

  const agent = await getAgentById(agentSlug);
  if (!agent) {
    return notFound();
  }


  const chat = await getChatById({ id: chatId });
  if (!chat) {
    notFound();
  }

  const session = await auth();


  const messagesFromDb = await getMessagesByChatId({
    id: chatId,
  });

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  const model = await getModelById(agent.model || "");
  console.log('Agent model:', model.model);

  
  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chatId}
          agentId={agent.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={model.model || DEFAULT_CHAT_MODEL}
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
        selectedChatModel={model.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
