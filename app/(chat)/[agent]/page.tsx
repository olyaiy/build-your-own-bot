import { notFound } from 'next/navigation';
import { getAgentById, getModelById } from '@/lib/db/queries';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: agentId } = await params;


  // get the agent
  const agent = await getAgentById(agentId);
  if (!agent) return notFound();


  // get the model for the agent
  const model = await getModelById(agent.model || "");

  // generate a unique id for the chat
  const id = generateUUID();


  return (
    <>
      <Chat
        key={id}
        id={id}
        agentId={agent.id}
        agent={agent}
        initialMessages={[]}
        selectedChatModel={model.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={"public"}
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
