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
// function logMessageDetails(messages: Array<any>) {
//   console.log(`\n🔄 Saving ${messages.length} messages:`);
  
//   // First pass: identify tool calls that need attention
//   const toolCallsToHighlight: { messageIndex: number, toolCallId: string }[] = [];
  
//   messages.forEach((msg, index) => {
//     if (Array.isArray(msg.content)) {
//       msg.content.forEach((content: any) => {
//         if (content.type === 'tool-call') {
//           // Mark this tool call for potential highlighting
//           toolCallsToHighlight.push({ 
//             messageIndex: index, 
//             toolCallId: content.toolCallId 
//           });
//         }
//       });
//     }
//   });
  
//   // Helper function to truncate text
//   const truncateText = (text: string, maxLength: number = 150) => {
//     if (typeof text !== 'string') return text;
//     return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
//   };
  
//   // Special helper for content fields that need shorter truncation
//   const truncateContent = (text: string) => {
//     if (typeof text !== 'string') return text;
//     const contentMaxLength = 100;
//     return text.length > contentMaxLength ? `${text.substring(0, contentMaxLength)}...` : text;
//   };
  
//   // Process messages with context
//   messages.forEach((msg, index) => {
//     // Check if this message or previous message needs highlighting
//     const isHighlightedMessage = toolCallsToHighlight.some(tc => 
//       tc.messageIndex === index || tc.messageIndex === index - 1
//     );
    
//     // Add attention-grabbing format for highlighted messages
//     const prefix = isHighlightedMessage 
//       ? `\n${'='.repeat(50)}\n[${index + 1}/${messages.length}] Role: ${msg.role}, ID: ${msg.id}\n${'='.repeat(50)}`
//       : `\n[${index + 1}/${messages.length}] Role: ${msg.role}, ID: ${msg.id}`;
    
//     console.log(prefix);
    
//     // For highlighted messages, use simplified logging
//     if (isHighlightedMessage) {
//       // Check if this is a tool call without result
//       if (Array.isArray(msg.content)) {
//         msg.content.forEach((content: any) => {
//           if (content.type === 'tool-call') {
//             // Check if this is a tool call without result
//             const isToolCallWithoutResult = toolCallsToHighlight.some(tc => 
//               tc.messageIndex === index && tc.toolCallId === content.toolCallId
//             );
            
//             if (isToolCallWithoutResult) {
//               console.log(`  🔴🔴🔴 TOOL CALL WITHOUT RESULT 🔴🔴🔴: ${content.toolName}`);
//             }
//           } else if (content.type === 'tool-result') {
//             // Check if this is a result for a previously highlighted tool call
//             const matchingToolCall = toolCallsToHighlight.find(tc => 
//               messages[tc.messageIndex]?.content?.some((c: any) => 
//                 c.type === 'tool-call' && c.toolCallId === content.toolCallId
//               )
//             );
            
//             if (matchingToolCall) {
//               console.log(`  🟢🟢🟢 TOOL RESULT FOR PREVIOUS CALL 🟢🟢🟢: ${content.toolCallId}`);
//               console.log(`    Success: ${!!content.result}`);
//             }
//           } else if (content.type === 'text') {
//             const text = content.text || '';
//             console.log(`  📝 Text: ${truncateText(text)}`);
//           }
//         });
//       } else if (typeof msg.content === 'string') {
//         console.log(`  Content: ${truncateText(msg.content)}`);
//       }
      
//       // Always show the full message object for highlighted messages
//       console.log(`  FULL MESSAGE OBJECT:`);
      
//       // Create a truncated version of the message
//       const truncatedMsg = JSON.parse(JSON.stringify(msg)); // Deep clone
      
//       // Truncate string content
//       if (typeof truncatedMsg.content === 'string') {
//         truncatedMsg.content = truncateText(truncatedMsg.content);
//       } 
//       // Truncate array content items
//       else if (Array.isArray(truncatedMsg.content)) {
//         truncatedMsg.content = truncatedMsg.content.map((item: any) => {
//           if (item.type === 'text' && typeof item.text === 'string') {
//             return { ...item, text: truncateText(item.text) };
//           } 
//           else if (item.type === 'tool-call' && typeof item.args === 'object') {
//             // Truncate string values in args
//             const truncatedArgs = {...item.args};
//             Object.keys(truncatedArgs).forEach(key => {
//               if (typeof truncatedArgs[key] === 'string') {
//                 // Special handling for content fields
//                 if (key === 'content') {
//                   truncatedArgs[key] = truncateContent(truncatedArgs[key]);
//                 } else {
//                   truncatedArgs[key] = truncateText(truncatedArgs[key]);
//                 }
//               }
              
//               // Handle search results with content fields
//               if (key === 'results' && Array.isArray(truncatedArgs[key])) {
//                 truncatedArgs[key] = truncatedArgs[key].map((result: any) => {
//                   if (result && typeof result === 'object') {
//                     const processedResult = {...result};
//                     if (typeof processedResult.content === 'string') {
//                       processedResult.content = truncateContent(processedResult.content);
//                     }
//                     return processedResult;
//                   }
//                   return result;
//                 });
//               }
              
//               // Handle images with descriptions
//               if (key === 'images' && Array.isArray(truncatedArgs[key])) {
//                 truncatedArgs[key] = truncatedArgs[key].map((image: any) => {
//                   if (image && typeof image === 'object') {
//                     const processedImage = {...image};
//                     if (typeof processedImage.description === 'string') {
//                       processedImage.description = truncateText(processedImage.description);
//                     }
//                     return processedImage;
//                   }
//                   return image;
//                 });
//               }
//             });
//             return { ...item, args: truncatedArgs };
//           }
//           else if (item.type === 'tool-result' && typeof item.result === 'object') {
//             // Handle complex tool results like search results
//             const truncatedResult = {...item.result};
            
//             // Handle search results with content fields
//             if (Array.isArray(truncatedResult.results)) {
//               truncatedResult.results = truncatedResult.results.map((result: any) => {
//                 if (result && typeof result === 'object') {
//                   const processedResult = {...result};
//                   if (typeof processedResult.content === 'string') {
//                     processedResult.content = truncateContent(processedResult.content);
//                   }
//                   return processedResult;
//                 }
//                 return result;
//               });
//             }
            
//             return { ...item, result: truncatedResult };
//           }
//           else if (item.type === 'tool-result' && typeof item.result === 'string') {
//             return { ...item, result: truncateText(item.result) };
//           }
//           return item;
//         });
//       }
      
//       console.log(JSON.stringify(truncatedMsg, null, 2));
//     }
//     // For non-highlighted messages, use the original detailed logging
//     else {
//       // Handle different content types
//       if (typeof msg.content === 'string') {
//         console.log(`  Content: ${truncateText(msg.content)}`);
//       } else if (Array.isArray(msg.content)) {
//         // Check for tool calls specifically
//         msg.content.forEach((content: any) => {
//           if (content.type === 'tool-call') {
//             console.log(`  🛠️ Tool Call: ${content.toolName}`);
//             console.log(`    ID: ${content.toolCallId}`);
            
//             // Special handling for updateDocument tool to truncate args
//             if (content.toolName === 'updateDocument') {
//               const argsStr = JSON.stringify(content.args);
//               console.log(`    Args: ${truncateText(argsStr)}`);
//             } else {
//               // For other tools, better handle potentially complex args
//               if (typeof content.args === 'object') {
//                 // If args contains description or text fields, truncate those specifically
//                 const processedArgs = {...content.args};
                
//                 // Process known fields differently
//                 if (processedArgs.description) {
//                   processedArgs.description = truncateText(processedArgs.description);
//                 }
//                 if (processedArgs.text) {
//                   processedArgs.text = truncateText(processedArgs.text);
//                 }
//                 // Special handling for content fields in search results
//                 if (processedArgs.content) {
//                   processedArgs.content = truncateContent(processedArgs.content);
//                 }
//                 // If there's a results array with content fields, truncate those too
//                 if (Array.isArray(processedArgs.results)) {
//                   processedArgs.results = processedArgs.results.map((result: any) => {
//                     if (result && typeof result === 'object' && result.content) {
//                       return {...result, content: truncateContent(result.content)};
//                     }
//                     return result;
//                   });
//                 }
//                 // If there are images with descriptions, truncate those
//                 if (Array.isArray(processedArgs.images)) {
//                   processedArgs.images = processedArgs.images.map((image: any) => {
//                     if (image && typeof image === 'object' && image.description) {
//                       return {...image, description: truncateText(image.description)};
//                     }
//                     return image;
//                   });
//                 }
                
//                 console.log(`    Args: ${JSON.stringify(processedArgs)}`);
//               } else {
//                 console.log(`    Args: ${JSON.stringify(content.args)}`);
//               }
//             }
            
//             console.log(`    Has Result: ${false}`);
//           } else if (content.type === 'tool-result') {
//             console.log(`  ✅ Tool Result: ${content.toolCallId}`);
//             console.log(`    Success: ${!!content.result}`);
//           } else if (content.type === 'text') {
//             const text = content.text || '';
//             console.log(`  📝 Text: ${truncateText(text)}`);
//           }
//         });
//       }
//     }
//   });
  
//   console.log('\n');
// }

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

  // Get the model details
  const modelDetails = await getModelById(selectedModelId);
  const providerOptions = modelDetails?.provider_options;

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
        // onStepFinish: async (step) => {
        // // IF user is logged in
        //   if (session.user?.id) {
        //   // Sanitize the response messages
        //     try {
        //       const sanitizedResponseMessages = sanitizeResponseMessages({
        //         messages: step.response.messages,
        //         reasoning: step.reasoning,
        //       });

        //   // Wait for the usage promise to resolve
        //     const tokenUsage = await step.usage;
              
        

        //       const messagesToSave = [
        //         //  add assistant and tool messages with completion tokens
        //         ...sanitizedResponseMessages.map((message) => {
        //           return {
        //             id: message.id,
        //             chatId: id,
        //             role: message.role,
        //             content: message.content,
        //             createdAt: new Date(),
        //             model_id: selectedModelId
            
        //           };
        //         })
        //       ];

        //   // Calculate cost based on token usage and model rates
        //     const inputCost = (((tokenUsage?.promptTokens || 0) * parseFloat(modelDetails?.cost_per_million_input_tokens || '0')) / 1000000) * -1.18 ;
        //     const outputCost = (((tokenUsage?.completionTokens || 0) * parseFloat(modelDetails?.cost_per_million_output_tokens || '0')) / 1000000) * -1.18;

        //   // Record the transaction
        //       await recordTransaction({
        //         userId: session.user.id,
        //         amount: inputCost,
        //         type: 'usage',
        //         description: 'Chat completion',
        //         // messageId: userMessage.id,
        //         tokenType: 'input',
        //         tokenAmount: tokenUsage?.promptTokens || 0,
        //         modelId: selectedModelId
        //       });
        //       await recordTransaction({
        //         userId: session.user.id,
        //         amount: outputCost,
        //         type: 'usage',
        //         description: 'Chat completion',
        //         // messageId: messagesToSave[messagesToSave.length - 1]?.id,
        //         tokenType: 'output',
        //         tokenAmount: tokenUsage?.completionTokens || 0,
        //         modelId: selectedModelId
        //       });

        //       // Log the message details
        //       // logMessageDetails(messagesToSave);
              
        //       // Save all messages including the user message in one operation
        //       await saveMessages({
        //         messages: messagesToSave,
        //         user_id: session.user.id,
        //       });


        //     } catch (error) {
        //       console.error('Failed to save chat');
        //     }
        //   }
        // },

        onFinish: async ({ response, reasoning, usage }) => {

          if (session.user?.id) {
            // Sanitize the response messages
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning: reasoning,
                });
  
            // Wait for the usage promise to resolve
              const tokenUsage = await usage;
                
          
  
                const messagesToSave = [
                
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
                // logMessageDetails(messagesToSave);
                
                // Save all messages including the user message in one operation
                await saveMessages({
                  messages: messagesToSave,
                  user_id: session.user.id,
                });
  
  
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          // logMessageDetails(response.messages);
        },

        // onFinish: async ({ response, reasoning }) => {
        //   if (session.user?.id) {
        //     try {
        //       const sanitizedResponseMessages = sanitizeResponseMessages({
        //         messages: response.messages,
        //         reasoning,
        //       });

        //       await saveMessages({
        //         messages: sanitizedResponseMessages.map((message) => {
        //           return {
        //             id: message.id,
        //             chatId: id,
        //             role: message.role,
        //             content: message.content,
        //             createdAt: new Date(),
        //             model_id: selectedModelId
        //           };
        //         }),
        //       });
        //     } catch (error) {
        //       console.error('Failed to save chat');
        //     }
        //   }
        // },
   
        
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
