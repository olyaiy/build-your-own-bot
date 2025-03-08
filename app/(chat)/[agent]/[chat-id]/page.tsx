// import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat/chat';
import { 
  getChatById, 
  getMessagesByChatId, 
  getAgentWithModelById,
  getAgentWithAvailableModels
} from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';

import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/util/data-stream-handler';

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

  // Get all available models for this agent
  const agentWithAvailableModels = await getAgentWithAvailableModels(agentSlug);
  const availableModels = agentWithAvailableModels?.availableModels || [];
  
  // Get the chat's existing model ID if one exists
  const existingModelId = agentWithModel.model?.id;
  
  // Find the default model's ID, falling back to DEFAULT_CHAT_MODEL if no default is set
  const defaultModel = availableModels.find(model => model.isDefault);
  const defaultModelId = defaultModel?.id || DEFAULT_CHAT_MODEL;
  
  // Use existing model ID if available, otherwise use the default model
  const selectedModelId = existingModelId || defaultModelId;

  const chat = await getChatById({ id: chatId });
  if (!chat) notFound();

  const session = await auth();
  const messagesFromDb = await getMessagesByChatId({ id: chatId });
  // const cookieStore = await cookies();
  // const chatModelFromCookie = cookieStore.get('chat-model');

  const ui_messages = convertToUIMessages(messagesFromDb)



  return (
    <>
      <Chat
        id={chatId}
        agent={agentWithModel.agent}
        availableModels={availableModels}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chatId} />
    </>
  );
}
