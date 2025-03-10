import { notFound } from 'next/navigation';
import { getAgentWithAvailableModels } from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { Chat } from '@/components/chat/chat';
import { DataStreamHandler } from '@/components/util/data-stream-handler';
import { getColorScheme, getDefaultColorScheme } from '@/lib/colors';
import type { Agent } from '@/lib/db/schema';

export default async function Page({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: agentId } = await params;

  // Query for agent with all available models
  const agentData = await getAgentWithAvailableModels(agentId);
  if (!agentData?.agent) return notFound();
  
  // Get the default model's ID, falling back to DEFAULT_CHAT_MODEL if no default is set
  const defaultModel = agentData.availableModels.find(model => model.isDefault);
  const defaultModelId = defaultModel?.id || DEFAULT_CHAT_MODEL;

  // Generate a unique ID for this chat session
  const id = generateUUID();

 

  return (
    <>
      <Chat
        key={id}
        id={id}
        agent={agentData.agent as Agent}
        availableModels={agentData.availableModels}
        initialMessages={[]}
        selectedChatModel={defaultModelId}
        selectedVisibilityType="public"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
