// import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId, getAgentWithModelById } from '@/lib/db/queries';
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

  const agentWithModel = await getAgentWithModelById(agentSlug);
  if (!agentWithModel?.agent) {
    return notFound();
  }

  const chat = await getChatById({ id: chatId });
  if (!chat) notFound();

  const session = await auth();
  const messagesFromDb = await getMessagesByChatId({ id: chatId });
  // const cookieStore = await cookies();
  // const chatModelFromCookie = cookieStore.get('chat-model');

  return (
    <>
      <Chat
        id={chatId}
        agent={agentWithModel.agent}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={agentWithModel.model?.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
