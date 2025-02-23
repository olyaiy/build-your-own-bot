import { notFound } from 'next/navigation';
import { getAgentWithModelById } from '@/lib/db/queries';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: agentId } = await params;

  // query for agent+model
  const agentWithModel = await getAgentWithModelById(agentId);
  if (!agentWithModel?.agent) return notFound();

  const id = generateUUID();

  return (
    <>
      <Chat
        key={id}
        id={id}
        agent={agentWithModel.agent}
        initialMessages={[]}
        selectedChatModel={agentWithModel.model?.model || DEFAULT_CHAT_MODEL}
        selectedVisibilityType={"public"}
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
