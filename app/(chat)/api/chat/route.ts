import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { supportsTools, myProvider } from '@/lib/ai/models';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  getToolGroupsByAgentId,
  getToolsByToolGroupId,
  getModelById,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';


import { generateTitleFromUserMessage } from '../../actions';

import { toolRegistry } from '@/lib/ai/tools/registry';


export const maxDuration = 60;



export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel, // The model name/identifier for the AI request
    selectedModelId, // The actual database model ID for saving
    agentId,
    agentSystemPrompt,
    searchEnabled,
  }: { 
    id: string; 
    messages: Array<Message>; 
    selectedChatModel: string; 
    selectedModelId: string;
    agentId: string;
    agentSystemPrompt?: string;
    searchEnabled?: boolean;
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

  const modelDetails = await getModelById(selectedModelId);
  const jsonProviderOptions = modelDetails?.provider_options as Record<string, Record<string, any>> | undefined;
  const providerOptions = JSON.parse(JSON.stringify(jsonProviderOptions));

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

      
      
      // Create tools object with the appropriate tools
      const registry = toolRegistry({ 
        session, 
        dataStream,
        messages // Pass the messages to the tool registry
      });

      const tools: Record<string, any> = {};
      for (const toolName of availableToolNames) {
        // Special handling for searchTool based on the searchEnabled flag
        // Only exclude the search tool if searchEnabled is explicitly false
        if (toolName === 'searchTool' && searchEnabled === false) {
          continue; // Skip adding the search tool if searchEnabled is false
        }

        if (toolName === 'retrieveTool' && searchEnabled === false) {
          continue; // Skip adding the search tool if searchEnabled is false
        }

        
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
        maxSteps: 10,
        experimental_activeTools:
          supportsTools(selectedChatModel) && activeToolNames.length > 0
            ? activeToolNames
            : [],

        providerOptions,
        // providerOptions: {
        //   anthropic: {
        //     thinking: { type: 'enabled', budgetTokens: 12000 },
        //   },
        // },      
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools,
        onFinish: async ({ response, reasoning, usage }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });


              // Wait for the usage promise to resolve
              const tokenUsage = await usage;

              // Calculate cost based on token usage and model rates
              const inputCost = ((tokenUsage?.promptTokens || 0) * parseFloat(modelDetails?.cost_per_million_input_tokens || '0')) / 1000000;
              const outputCost = ((tokenUsage?.completionTokens || 0) * parseFloat(modelDetails?.cost_per_million_output_tokens || '0')) / 1000000;

              
              // Prepare all messages to save, including the user message with prompt tokens
              const messagesWithTokenUsage = [
                // Add the user message first with prompt tokens
                {
                  ...userMessage,
                  chatId: id,
                  createdAt: new Date(),
                  token_usage: tokenUsage?.promptTokens || null,
                },
                // Then add assistant and tool messages with completion tokens
                ...sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                    token_usage: message.role === 'assistant' 
                      ? tokenUsage?.completionTokens || null 
                      : tokenUsage?.totalTokens || null,
                  };
                })
              ];
              
              // Map the messages to include the model_id for each message
              const messagesWithTokenUsageAndModel = messagesWithTokenUsage.map(msg => ({
                ...msg,
                model_id: selectedModelId, // Use the database model ID for saving
              }));

              
              // Save all messages including the user message in one operation
              await saveMessages({
                messages: messagesWithTokenUsageAndModel,
                user_id: session.user.id,
                inputCost,
                outputCost
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
      
      // Save at least the user message if we encounter an error
      // We'll do this in a fire-and-forget manner to avoid changing the return type
      if (session.user?.id) {
        (async () => {
          try {
            await saveMessages({
              messages: [{
                ...userMessage,
                chatId: id,
                createdAt: new Date(),
                token_usage: null, // No token usage available in error case
                model_id: selectedModelId // Use the database model ID for saving
              }]
            });
          } catch (saveError) {
            console.error('Failed to save user message on error:', saveError);
          }
        })();
      }
      
      // Return a more descriptive error message
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      } else if (typeof error === 'string') {
        return `Error: ${error}`;
      } else {
        return 'Oops, an error occurred! Please try again.';
      }
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
