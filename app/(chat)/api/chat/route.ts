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
  recordTransaction,
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
    creatorId,
    searchEnabled,
  }: { 
    id: string; 
    messages: Array<Message>; 
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
      console.error('Failed to create chat:', error);
      return new Response('Failed to create chat', { status: 500 });
    }
  }

  // THEN save messages 
  await saveMessages({
    messages: [{
      ...userMessage, 
      model_id: selectedModelId,
      chatId: id,
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


     
    /* -------- STREAM TEXT -------- */
      // Initialize running tally for usage
      // const runningTally = {
      //   promptTokens: 0,
      //   completionTokens: 0,
      //   totalTokens: 0
      // };

      const result = streamText({
        
        // Model
          model: myProvider.languageModel(selectedChatModel),
        // System Prompt
          system: systemPrompt({ 
            selectedChatModel, 
            agentSystemPrompt,
            hasSearchTool: activeToolNames.includes('searchTool')
          }),
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

        

        onStepFinish: async ({ stepType, response, reasoning, usage }) => {
          console.log('🤖 THE STEP TYPE IS:', stepType);
          console.log('💬 THE USAGE IS:', usage);
          
          // Increment step counter for each step
          stepCounter++;
          console.log(`🔢 CURRENT STEP: ${stepCounter}`);

          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });
              
              // Debug: Log message IDs before adding to accumulated messages
              console.log('🔍 Message IDs to accumulate:', sanitizedResponseMessages.map(m => m.id));
              
              // Filter out messages that already exist in accumulatedMessages
              const newMessages = sanitizedResponseMessages.filter(msg => 
                !accumulatedMessages.some(existingMsg => existingMsg.id === msg.id)
              );
              
              if (newMessages.length < sanitizedResponseMessages.length) {
                console.log('⚠️ Filtered out duplicate messages:', 
                  sanitizedResponseMessages.length - newMessages.length);
              }
              
              accumulatedMessages.push(...newMessages.map((message) => {
                return {
                  id: message.id,
                  chatId: id,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date(),
                  model_id: selectedModelId
                };
              }));
              
              // Debug: Log accumulated message IDs after adding
              console.log('📊 Total accumulated messages:', accumulatedMessages.length);
              console.log('📋 Accumulated message IDs:', accumulatedMessages.map(m => m.id));
            
            } catch (error) {
              console.error('Failed to save chat TEMPORARILY');
            }
          }

          // Update running tally if usage is available
          if (usage) {
            runningTally.promptTokens += usage.promptTokens || 0;
            runningTally.completionTokens += usage.completionTokens || 0;
            runningTally.totalTokens += usage.totalTokens || 0;
            
            console.log('🧮 RUNNING TALLY:', runningTally);
          }

          // Only throw error on the fourth step
          if (stepCounter === 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            throw new Error('This is a test error on step 4');
          }
        },

        /* ---- ON FINISH ---- */
        onFinish: async ({ response, reasoning, usage, finishReason }) => {
          console.log('THE FINISHED REASON IS --->', finishReason);
          
          

          // Compare running tally with final usage
          if (usage) {
            // console.log('📊 FINAL USAGE:', usage);
            // console.log('🧮 RUNNING TALLY:', runningTally);
            
            const tallyMatchesUsage = 
              runningTally.promptTokens === usage.promptTokens && 
              runningTally.completionTokens === usage.completionTokens &&
              runningTally.totalTokens === usage.totalTokens;
            
            if (tallyMatchesUsage) {
              console.log('✅ 🎉 🥳 TALLY MATCHES FINAL USAGE! 🎯 🙌 💯');
            } else {
              console.log('❌ TALLY DOES NOT MATCH FINAL USAGE');
              console.log('Difference in promptTokens:', usage.promptTokens - runningTally.promptTokens);
              console.log('Difference in completionTokens:', usage.completionTokens - runningTally.completionTokens);
              console.log('Difference in totalTokens:', usage.totalTokens - runningTally.totalTokens);
            }
          }

          // Save the messages
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });
              
              // Debug: Log sanitized message IDs before saving
              console.log('💾 About to save message IDs:', sanitizedResponseMessages.map(m => m.id));
              
              // Track which message IDs we're saving
              sanitizedResponseMessages.forEach(msg => savedMessageIds.add(msg.id));
              
              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                    model_id: selectedModelId
                  };
                }),
              });


              // Instead of calculating cost here, use recordTransaction to track usage
              if (usage && modelDetails) {
              await recordTransaction({
                agentId: agentId,
                userId: session.user.id,
                type: creatorId === session.user.id ? 'self_usage' : 'usage',
                messageId: sanitizedResponseMessages[0]?.id,
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
              console.error('Failed to save chat');
            }
          }

          console.log('THE ACCUMULATED MESSAGES ARE --->', accumulatedMessages);
          console.log('THE MESSAGES ARE --->', messages);
    
        },
   
        
      });



      result.consumeStream();      
      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });

    },
    
    /* -------- ERROR HANDLING -------- */
    onError: (error: unknown) => {
      console.error('THE MASSIVE Error in chat:', error);
      console.log('💰 USAGE TALLY AT ERROR:', runningTally);
      
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
            console.log('✅ Successfully recorded transaction for error case');
          } catch (txError) {
            console.error('Failed to record transaction on error:', txError);
          }
        })().catch(e => console.error('Unhandled error in fire-and-forget transaction:', e));
      }
      
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
      
      // Save accumulated messages to the database if we have any
      if (accumulatedMessages.length > 0 && session?.user?.id) {
        (async () => {
          try {
            console.log('🔄 About to save accumulated messages in error handler');
            console.log('📋 Message IDs to save in error handler:', accumulatedMessages.map(m => m.id));
            
            // Check if we have any message IDs that were already saved in onFinish
            const duplicateIds = accumulatedMessages
              .map(msg => msg.id)
              .filter(id => savedMessageIds.has(id));
            
            if (duplicateIds.length > 0) {
              console.log('⚠️ Found duplicate message IDs that were already saved:', duplicateIds);
              // Filter out messages that were already saved
              const uniqueMessages = accumulatedMessages.filter(msg => !savedMessageIds.has(msg.id));
              console.log(`🔢 Filtered from ${accumulatedMessages.length} to ${uniqueMessages.length} unique messages`);
              
              if (uniqueMessages.length > 0) {
                await saveMessages({
                  messages: uniqueMessages,
                });
                console.log('✅ Successfully saved filtered unique messages');
              } else {
                console.log('⏭️ No unique messages to save, skipping saveMessages call');
              }
            } else {
              // No duplicates, proceed with saving all accumulated messages
              await saveMessages({
                messages: accumulatedMessages,
              });
              console.log('✅ Successfully saved all accumulated messages');
            }
          } catch (saveError) {
            console.error('Failed to save accumulated messages on error:', saveError);
          }
        })().catch(e => console.error('Unhandled error in fire-and-forget message save:', e));
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
