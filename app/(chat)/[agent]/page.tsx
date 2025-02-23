import { notFound } from 'next/navigation';
import { getAgentBySlug, getModelById } from '@/lib/db/queries';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page({ params }: { params: { agent: string } }) {
  const agent = await getAgentBySlug(params.agent);
  if (!agent) return notFound();

  const model = agent.model ? await getModelById(agent.model) : null;
  
  // Log model info
  console.log('Selected Model:', {
    provider: model?.provider,
    model: model?.model
  });

  return (
    <>
      <Chat
        key={agent.id}
        id={agent.id}
        initialMessages={[]}
        selectedChatModel={model?.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={"public"}
        isReadonly={false}
      />
      <DataStreamHandler id={agent.id} />
    </>
  );
}
