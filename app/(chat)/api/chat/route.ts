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
  recordTransaction
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
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

  // Check if user has enough credits
  const userHasCredits = await hasCredits(session.user.id);
  if (!userHasCredits) {
    return new Response(INSUFFICIENT_CREDITS_MESSAGE, { status: 402 });
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
  const providerOptions = modelDetails?.provider_options;



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

      console.log('🔧 Available tools:', activeToolNames);
      console.log('🔧 searchTool included:', activeToolNames.includes('searchTool'));


      // Create a custom search tool with additional logging
      if (tools.searchTool) {
        const originalSearchTool = tools.searchTool;
        tools.searchTool = {
          description: originalSearchTool.description,
          parameters: originalSearchTool.parameters,
          execute: async (args: any, options: any) => {
            console.log('🔍 Custom searchTool execution started with args:', 
              JSON.stringify(args).substring(0, 100) + '...');
            console.log('🔍 Tool call ID:', options?.toolCallId);
            
            try {
              const result = await originalSearchTool.execute(args, options);
              console.log('✅ searchTool execution successful, got result:', 
                typeof result === 'object' ? 
                  `object with ${Object.keys(result).length} properties` : 
                  typeof result);
              
              // Ensure proper result format
              if (!result || typeof result !== 'object') {
                console.error('🚨 Invalid result format from searchTool, returning empty result');
                return {
                  results: [],
                  query: args.query || '',
                  images: [],
                  number_of_results: 0
                };
              }
              
              return result;
            } catch (error) {
              console.error('🚨 searchTool execution error:', error);
              // Return fallback result to prevent stream breaking
              return {
                results: [],
                query: args.query || '',
                images: [],
                number_of_results: 0,
                error: 'Search failed'
              };
            }
          }
        };
        console.log('🔧 Enhanced searchTool with logging and error handling');
      }

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

     
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools,
        

        providerOptions: providerOptions as any,
        
        onStepFinish: async (step) => {
          console.log('🔄 onStepFinish called, step type:', step.stepType);
          
          // Safely check for tool invocations
          const hasToolCalls = step.response.messages.some(msg => 
            // @ts-ignore - toolInvocations might not be in the type but can exist at runtime
            msg.toolInvocations && Array.isArray(msg.toolInvocations) && msg.toolInvocations.length > 0
          );
          console.log('🔄 Response contains tool calls:', hasToolCalls);

          // Log any tool invocations in the response
          step.response.messages.forEach(msg => {
            // @ts-ignore - toolInvocations might not be in the type but can exist at runtime
            const toolInvocations = msg.toolInvocations;
            if (toolInvocations && Array.isArray(toolInvocations) && toolInvocations.length > 0) {
              console.log('🛠️ Found tool invocations in message:', 
                // @ts-ignore - safely access tool properties
                toolInvocations.map(tool => ({
                  id: tool.toolCallId,
                  name: tool.toolName,
                  state: tool.state,
                  hasResult: tool && typeof tool === 'object' && 'result' in tool
                }))
              );
            }
          });

          if (session.user?.id) {

            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: step.response.messages,
                reasoning: step.reasoning,
              });


              // Wait for the usage promise to resolve
              const tokenUsage = await step.usage;
              
              // Calculate cost based on token usage and model rates
              const inputCost = (((tokenUsage?.promptTokens || 0) * parseFloat(modelDetails?.cost_per_million_input_tokens || '0')) / 1000000) * -1.18 ;
              const outputCost = (((tokenUsage?.completionTokens || 0) * parseFloat(modelDetails?.cost_per_million_output_tokens || '0')) / 1000000) * -1.18;


              const messagesToSave = [
                // First add user message
                ...(step.stepType === 'initial' ? [{
                  ...userMessage,
                  id: userMessage.id,
                  chatId: id,
                  createdAt: new Date(),
                  model_id: null // Add model_id with null default
                }] : []),
                // Then add assistant and tool messages with completion tokens
                ...sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                    model_id: selectedModelId
            
                  };
                })
              ];


              await recordTransaction({
                userId: session.user.id,
                amount: inputCost,
                type: 'usage',
                description: 'Chat completion',
                // messageId: userMessage.id,
                tokenType: 'input',
                tokenAmount: tokenUsage?.promptTokens || 0,
                modelId: selectedModelId
                });

              await recordTransaction({
                userId: session.user.id,
                amount: outputCost,
                type: 'usage',
                description: 'Chat completion',
                // messageId: messagesToSave[messagesToSave.length - 1]?.id,
                tokenType: 'output',
                tokenAmount: tokenUsage?.completionTokens || 0,
                modelId: selectedModelId
              });

              // Save all messages including the user message in one operation
              await saveMessages({
                messages: messagesToSave,
                user_id: session.user.id,
              });


            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        onFinish: async (result) => {
          console.log('messagesToSave', messages);
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
    onError: (error: unknown) => {
      console.error('THE MASSIVE Error in chat:', error);
      
      // Add detailed debugging for tool invocation errors
      if (error instanceof Error && error.message && error.message.includes('ToolInvocation must have a result')) {
        console.error('🚨 ToolInvocation Error Details:');
        try {
          // Extract the tool invocation data from the error message
          const match = error.message.match(/ToolInvocation must have a result: (.*)/);
          if (match && match[1]) {
            const toolData = JSON.parse(match[1]);
            console.error('🚨 Failed Tool Invocation:', {
              toolName: toolData.toolName,
              toolCallId: toolData.toolCallId,
              args: toolData.args,
              state: toolData.state
            });
            
            // Log search configuration info
            if (toolData.toolName === 'searchTool') {
              console.error('🚨 Search tool config:', {
                searchEnabled,
                isTavilyEnabled: !!process.env.TAVILY_API_KEY
              });
            }
          }
        } catch (parseError) {
          console.error('🚨 Failed to parse tool invocation data:', parseError);
        }
      }
      
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
