import {
  type Message,UIMessage,
  appendResponseMessages,
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
  recordTransaction,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { toolRegistry } from '@/lib/ai/tools/registry';
import { hasCredits, INSUFFICIENT_CREDITS_MESSAGE } from '@/lib/credits';


export async function POST(request: Request) {

  const {
    id,
    messages,
    selectedChatModel, // The model name/identifier for the AI request
    selectedModelId, // The actual database model ID for saving
    agentId,
    agentSystemPrompt,  
    creatorId,
    searchEnabled,
  }: { 
    id: string; 
    messages: Array<UIMessage>; 
    selectedChatModel: string; 
    selectedModelId: string;
    agentId: string;
    agentSystemPrompt?: string;
    creatorId: string;
    searchEnabled?: boolean;
  } = await request.json();
  
  // Get the session
  const session = await auth();

  // If the user is not logged in, return an error
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check if user has enough credits
  const userHasCredits = await hasCredits(session.user.id);
  if (!userHasCredits) {
    return new Response(INSUFFICIENT_CREDITS_MESSAGE, { status: 402 });
  }

  // Get the most recent user message
  const userMessage = getMostRecentUserMessage(messages);

  // If the user message is not found, return an error
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Get the chat
  const chat = await getChatById({ id });

  // If the chat is not found, generate a title and save the chat FIRST
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    try {
      await saveChat({ id, userId: session.user.id, title, agentId });
    } catch (error) {
      return new Response('Failed to create chat', { status: 500 });
    }
  }


  
  // THEN save messages 
  await saveMessages({
    messages: [{

      chatId: id,
      id: userMessage.id,
      role: 'user',
      parts: userMessage.parts,
      attachments: userMessage.experimental_attachments ?? [],
      model_id: selectedModelId,
      createdAt: new Date(),
    }],
  });

  // Get the model details
  const modelDetails = await getModelById(selectedModelId);
  const providerOptions = modelDetails?.provider_options;

  // Initialize running tally for usage outside execute to make it accessible to onError
  const runningTally = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };

  // Initialize array to accumulate messages outside execute to make it accessible to onError
  const accumulatedMessages: any[] = [];

  // Initialize step counter
  let stepCounter = 0;

  // Track saved message IDs to avoid duplicates
  const savedMessageIds = new Set<string>();

  // 
  return createDataStreamResponse({
    execute: async (dataStream) => {


      /* -------- TOOLS SET UP -------- */
        // Fetch the tool groups for this agent
        const agentToolGroups = await getToolGroupsByAgentId(agentId);
        console.log('🔍 AGENT TOOL GROUPS:', JSON.stringify(agentToolGroups, null, 2));

        // Get all the tools from the agent's tool groups
        const toolsPromises = agentToolGroups.map(toolGroup => 
          getToolsByToolGroupId(toolGroup.id)
        );
        const toolsResults = await Promise.all(toolsPromises);
        console.log('🔧 TOOLS FROM GROUPS:', JSON.stringify(toolsResults, null, 2));

        // Flatten and get unique tool names
        const availableToolNames = [...new Set(
          toolsResults
            .flat()
            .map(tool => tool.tool)
        )];
        console.log('🛠️ AVAILABLE TOOL NAMES:', availableToolNames);

        // Create tools object with the appropriate tools
        const registry = toolRegistry({ 
          session, 
          dataStream,
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

          
          if (registry[toolName as keyof typeof registry]) {
            tools[toolName] = registry[toolName as keyof typeof registry];
          }
        }
        // Get the list of tool names that are actually available
        const activeToolNames = Object.keys(tools);
        console.log('🔍 ACTIVE TOOL NAMES:', activeToolNames);


     
    /* -------- STREAM TEXT -------- */
      const result = streamText({
        
        // Model
          model: myProvider.languageModel(selectedChatModel),
        // System Prompt
          // system: systemPrompt({ 
          //   selectedChatModel, 
          //   agentSystemPrompt,
          //   hasSearchTool: activeToolNames.includes('searchTool')
          // }),
        // Messages
          messages,
        // Max Steps
          maxSteps: 10,
        // Active Tools
          experimental_activeTools:
            supportsTools(selectedChatModel) && activeToolNames.length > 0
              ? activeToolNames
              : [],
        // Tools
          tools,
        // config
        experimental_transform: smoothStream({
          delayInMs: 10, // optional: defaults to 10ms
          chunking: 'word', // optional: defaults to 'word'
        }),
        providerOptions: providerOptions as any,
        experimental_generateMessageId: generateUUID,
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
        toolCallStreaming: true,

        
        /* ---- ON FINISH ---- */
        onFinish: async ({ response, reasoning, usage }) => {
          // Save the messages
          if (session.user?.id) {
            try {

              const assistantId = getTrailingMessageId({
                messages: response.messages.filter(
                  (message) => message.role === 'assistant',
                ),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [userMessage],
                responseMessages: response.messages,
              });

              
              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chatId: id,
                    role: assistantMessage.role,
                    parts: assistantMessage.parts,
                    attachments:
                        assistantMessage.experimental_attachments ?? [],
                    createdAt: new Date(),
                    model_id: selectedModelId
                  },
                ],
              });


              // Instead of calculating cost here, use recordTransaction to track usage
              if (usage && modelDetails) {
              await recordTransaction({
                agentId: agentId,
                userId: session.user.id,
                type: creatorId === session.user.id ? 'self_usage' : 'usage',
                messageId: assistantId,
                modelId: selectedModelId,
                costPerMillionInput: modelDetails.cost_per_million_input_tokens || '0',
                costPerMillionOutput: modelDetails.cost_per_million_output_tokens || '0',
                usage: {
                  promptTokens: usage.promptTokens,
                  completionTokens: usage.completionTokens
                }
              });
            }
                  
            } catch (error) {
              // Failed to save chat
            }
          }
        },
      });



      result.consumeStream();      
      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });

    },
    
    /* -------- ERROR HANDLING -------- */
    onError: (error: unknown) => {
      // Record the transaction using runningTally if we have accumulated tokens
      if (runningTally.totalTokens > 0 && session?.user?.id && modelDetails) {
        const userId = session.user.id; // Capture in variable for TypeScript
        // We use a fire-and-forget pattern here to avoid changing the return type of onError
        (async () => {
          try {
            await recordTransaction({
              agentId: agentId,
              userId: userId,
              type: creatorId === userId ? 'self_usage' : 'usage',
              messageId: userMessage.id || generateUUID(), // Ensure we have an ID
              modelId: selectedModelId,
              costPerMillionInput: modelDetails.cost_per_million_input_tokens || '0',
              costPerMillionOutput: modelDetails.cost_per_million_output_tokens || '0',
              usage: {
                promptTokens: runningTally.promptTokens,
                completionTokens: runningTally.completionTokens
              },
              description: 'Error occurred during generation - this was the usage up until the error'
            });
          } catch (txError) {
            // Failed to record transaction on error
          }
        })().catch(e => {/* Unhandled error in fire-and-forget transaction */});
      }
      
      // Save accumulated messages to the database if we have any
      if (accumulatedMessages.length > 0 && session?.user?.id) {
        (async () => {
          try {
            // Check if we have any message IDs that were already saved in onFinish
            const duplicateIds = accumulatedMessages
              .map(msg => msg.id)
              .filter(id => savedMessageIds.has(id));
            
            if (duplicateIds.length > 0) {
              // Filter out messages that were already saved
              const uniqueMessages = accumulatedMessages.filter(msg => !savedMessageIds.has(msg.id));
              
              if (uniqueMessages.length > 0) {
                await saveMessages({
                  messages: uniqueMessages,
                });
              }
            } else {
              // No duplicates, proceed with saving all accumulated messages
              await saveMessages({
                messages: accumulatedMessages,
              });
            }
          } catch (saveError) {
            // Failed to save accumulated messages on error
          }
        })().catch(e => {/* Unhandled error in fire-and-forget message save */});
      }
      
      // Return a more descriptive error message
      if (error instanceof Error) {
        return `Error: ${error.message} (Usage tally: ${JSON.stringify(runningTally)})`;
      } else if (typeof error === 'string') {
        return `Error: ${error} (Usage tally: ${JSON.stringify(runningTally)})`;
      } else {
        return `Oops, an error occurred! Please try again. (Usage tally: ${JSON.stringify(runningTally)})`;
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
