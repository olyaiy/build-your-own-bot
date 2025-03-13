import { notFound } from 'next/navigation';
import { getAgentWithAvailableModels } from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { Chat } from '@/components/chat/chat';
import { DataStreamHandler } from '@/components/util/data-stream-handler';
import { getColorScheme, getDefaultColorScheme } from '@/lib/colors';
import type { Agent, AgentCustomization } from '@/lib/db/schema';
import type { Metadata, ResolvingMetadata } from 'next';

// Generate metadata for SEO based on agent information
export async function generateMetadata(
  { params }: { params: { agent: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch agent data for SEO
  const agentData = await getAgentWithAvailableModels(params.agent);
  
  // Fall back to default metadata if agent not found
  if (!agentData?.agent) {
    return {
      title: 'Chat - Not Found',
      description: 'The requested agent could not be found.'
    };
  }
  
  const { agent } = agentData;
  
  // Extract custom title from agent customization if available
  const customization = agent.customization as AgentCustomization | undefined;
  const customTitle = customization?.overview?.title;
  
  return {
    title: agent.agent_display_name,
    description: agent.description || `Chat with ${agent.agent_display_name}`,
    openGraph: {
      title: customTitle || agent.agent_display_name,
      description: agent.description || `Chat with ${agent.agent_display_name}`,
      ...(agent.image_url && { images: [{ url: agent.image_url, alt: agent.agent_display_name }] }),
      type: 'website',
    },
    twitter: {
      card: agent.image_url ? 'summary_large_image' : 'summary',
      title: customTitle || agent.agent_display_name,
      description: agent.description || `Chat with ${agent.agent_display_name}`,
      ...(agent.image_url && { images: [agent.image_url] }),
    },
    alternates: {
      canonical: `/${agent.agent}`,
    },
  };
}

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
