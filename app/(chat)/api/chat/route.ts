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

/**
 * Utility function to log message details
 * Provides clear information about message structure, especially tool calls
 */
function logMessageDetails(messages: Array<any>) {
  console.log(`\n🔄 Saving ${messages.length} messages:`);
  
  messages.forEach((msg, index) => {
    // Basic message info
    console.log(`\n[${index + 1}/${messages.length}] Role: ${msg.role}, ID: ${msg.id}`);
    
    // Handle different content types
    if (typeof msg.content === 'string') {
      console.log(`  Content: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
    } else if (Array.isArray(msg.content)) {
      // Check for tool calls specifically
      msg.content.forEach((content: any) => {
        if (content.type === 'tool-call') {
          console.log(`  🛠️ Tool Call: ${content.toolName}`);
          console.log(`    ID: ${content.toolCallId}`);
          console.log(`    Args: ${JSON.stringify(content.args)}`);
          console.log(`    Has Result: ${false}`); // Initial tool calls don't have results yet
        } else if (content.type === 'tool-result') {
          console.log(`  ✅ Tool Result: ${content.toolCallId}`);
          console.log(`    Success: ${!!content.result}`);
        } else if (content.type === 'text') {
          const text = content.text || '';
          console.log(`  📝 Text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        }
      });
    }
  });
  console.log('\n');
}

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

  console.log('selected model id', selectedModelId);
  console.log('user message', userMessage);
  console.log('chat id', id);

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
    user_id: session.user.id,
  });

  const modelDetails = await getModelById(selectedModelId);
  const providerOptions = modelDetails?.provider_options;

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


     
    /* -------- STREAM TEXT -------- */
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
          experimental_transform: smoothStream({ chunking: 'word' }),
          providerOptions: providerOptions as any,
          experimental_generateMessageId: generateUUID,
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
          toolCallStreaming: true,
        
      /* -------- ON STEP FINISH -------- */
        onStepFinish: async (step) => {

        // IF user is logged in
          if (session.user?.id) {

          // Sanitize the response messages
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: step.response.messages,
                reasoning: step.reasoning,
              });

          // Wait for the usage promise to resolve
            const tokenUsage = await step.usage;
              
        

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

          // Calculate cost based on token usage and model rates
            const inputCost = (((tokenUsage?.promptTokens || 0) * parseFloat(modelDetails?.cost_per_million_input_tokens || '0')) / 1000000) * -1.18 ;
            const outputCost = (((tokenUsage?.completionTokens || 0) * parseFloat(modelDetails?.cost_per_million_output_tokens || '0')) / 1000000) * -1.18;

          // Record the transaction
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

              // Log the message details
              logMessageDetails(messagesToSave);
              
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


   
        
      });


      result.consumeStream();      
      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    
    /* -------- ERROR HANDLING -------- */
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
