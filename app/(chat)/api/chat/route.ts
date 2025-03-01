import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { supportsTools } from '@/lib/ai/models';
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  getToolGroupsByAgentId,
  getToolsByToolGroupId,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { Session } from 'next-auth';
import { retrieveTool } from '@/lib/ai/tools/retrieve';
import { toolRegistry } from '@/lib/ai/tools/registry';


export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel, // This will now be the ID of either the default model or a user-selected alternate model
    agentId,
    agentSystemPrompt,
  }: { 
    id: string; 
    messages: Array<Message>; 
    selectedChatModel: string; 
    agentId: string;
    agentSystemPrompt?: string;
  } = await request.json();


  
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    try {
      await saveChat({ id, userId: session.user.id, title, agentId });
    } catch (error) {
      console.error('Failed to create chat:', error);
      return new Response('Failed to create chat', { status: 500 });
    }
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Fetch the tool groups for this agent
      const agentToolGroups = await getToolGroupsByAgentId(agentId);
      
      // Get all the tools from the agent's tool groups
      const toolsPromises = agentToolGroups.map(toolGroup => 
        getToolsByToolGroupId(toolGroup.id)
      );
      
      const toolsResults = await Promise.all(toolsPromises);
      
      // Flatten and get unique tool names
      const availableToolNames = [...new Set(
        toolsResults
          .flat()
          .map(tool => tool.tool)
      )];
      
      // console.log(`Available tools for agent ${agentId}:`, availableToolNames);

      // Create tools object with the appropriate tools
      const registry = toolRegistry({ session, dataStream });

const tools: Record<string, any> = {};
for (const toolName of availableToolNames) {
  if (toolName in registry && registry[toolName as keyof typeof registry]) {
    tools[toolName] = registry[toolName as keyof typeof registry];
  }
}

      // Get the list of tool names that are actually available
      const activeToolNames = Object.keys(tools);

      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ 
          selectedChatModel, 
          agentSystemPrompt,
          hasSearchTool: activeToolNames.includes('searchTool')
        }),
        messages,
        maxSteps: 5,
        experimental_activeTools:
          supportsTools(selectedChatModel) && activeToolNames.length > 0
            ? activeToolNames
            : [],

        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools,
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
        toolCallStreaming: true,
        
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      console.error('THE MASSIVE Error in chat:', error);
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
