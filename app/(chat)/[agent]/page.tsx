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



  // generate a unique id for the chat
  const id = generateUUID();


  return (
    <>
      <Chat
        key={id}
        id={id}
        agentId={agent.agent}
        initialMessages={[]}
        selectedChatModel={model?.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={"public"}
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
