import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, or, sql} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { generateSlug, generateUUID } from '@/lib/utils';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  agents,
  models,
  agentModels,
  type Agent,
  type Model,
  toolGroups,
  type ToolGroup,
  agentToolGroups,
  tools,
  toolGroupTools,
  userCredits,
  userTransactions,
  transactionTypeEnum,
} from './schema';  
import { ArtifactKind } from '@/components/artifact/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    // Will use the index on user.email
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
  agentId,
}: {
  id: string;
  userId: string;
  title: string;
  agentId: string;
}) {
  try {
    const result = await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      agentId,
    });
    return result;
  } catch (error) {
    console.error('Failed to save chat in database:', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    // Will use the index on chat.userId
    return await db
      .select({
        id: chat.id,
        createdAt: chat.createdAt,
        title: chat.title,
        userId: chat.userId,
        agentId: chat.agentId,
        visibility: chat.visibility,
        agentDisplayName: agents.agent_display_name
      })
      .from(chat)
      .leftJoin(agents, eq(chat.agentId, agents.id)) // This join will use the index on chat.agentId
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt)); // Will use the index on chat.createdAt
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ 
  messages, 
  model_id,
  user_id,
  inputCost,
  outputCost
}: { 
  messages: Array<Message>; 
  model_id?: string;
  user_id?: string;
  inputCost?: number;
  outputCost?: number;
}) {
  try {
    // Add generated UUIDs and apply model_id if provided
    const messagesToSave = messages.map(msg => ({
      ...msg,
      id: msg.id || generateUUID(), // Generate UUID if not already present
      model_id: model_id || msg.model_id,
    }));

    
    // Use a transaction to ensure both operations are atomic
    await db.transaction(async (tx) => {
      // Insert messages
      await tx.insert(message).values(messagesToSave);
      
      // Insert transaction records for the entire batch if user_id is provided
      if (user_id && messagesToSave.length > 0) {
        // Define the type for transaction records
        type TransactionRecord = {
          userId: string;
          amount: string;
          type: 'usage';
          description: string;
          messageId: string;
        };
        
        const transactionRecords: TransactionRecord[] = [];
        
        // Find user and assistant messages
        const userMessage = messagesToSave.find(msg => msg.role === 'user');
        const assistantMessage = messagesToSave.find(msg => msg.role === 'assistant');
        
        // Calculate total cost for credit deduction
        let totalCost = 0;
        
        // Add input cost transaction if it exists (associated with user message)
        if (inputCost && inputCost > 0 && userMessage) {
          transactionRecords.push({
            userId: user_id,
            amount: (-inputCost).toString(), // Store as negative value to indicate deduction
            type: 'usage' as const,
            description: 'Input tokens',
            messageId: userMessage.id,
          });
          totalCost += inputCost;
        }
        
        // Add output cost transaction if it exists (associated with assistant message)
        if (outputCost && outputCost > 0 && assistantMessage) {
          transactionRecords.push({
            userId: user_id,
            amount: (-outputCost).toString(), // Store as negative value to indicate deduction
            type: 'usage' as const,
            description: 'Output tokens',
            messageId: assistantMessage.id,
          });
          totalCost += outputCost;
        }
        
        // Only proceed if there are costs to process
        if (totalCost > 0) {
          // Insert transaction records
          await tx.insert(userTransactions).values(transactionRecords);
          
          // Check if user has a credits record
          const userCreditRows = await tx
            .select()
            .from(userCredits)
            .where(eq(userCredits.user_id, user_id));
          
          if (userCreditRows.length > 0) {
            // User has a record, update it with the subtraction
            await tx
              .update(userCredits)
              .set({
                credit_balance: sql`${userCredits.credit_balance} - ${totalCost.toString()}`
              })
              .where(eq(userCredits.user_id, user_id));
          } else {
            // User doesn't have a record yet, create one with negative balance
            // (or starting from 0 and subtracting the cost)
            await tx
              .insert(userCredits)
              .values({
                user_id: user_id,
                credit_balance: (-totalCost).toString(),
                lifetime_credits: '0'
              });
          }
        }
      }
    });
    
    // Return the messages with their generated IDs
    return messagesToSave;
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    // Will use the index on message.chatId
    return await db.select().from(message).where(eq(message.chatId, id)).orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database');
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    // Check if a vote already exists
    const existingVote = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId))); // Will use the index on vote.messageId

    // If a vote exists, update it
    if (existingVote.length > 0) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId))); // Uses indexes on both messageId and chatId
    }

    // If no vote exists, create one
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to save vote in database');
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

// Define extended types for the agent with models
type AgentWithModels = Agent & {
  models: Model[];
  defaultModel: Model | null;
};

export const getAgents = async (userId?: string, includeAllModels?: boolean) => {
  try {
    const result = await db.select({
      id: agents.id,
      agent: agents.agent,
      agent_display_name: agents.agent_display_name,
      system_prompt: agents.system_prompt,
      description: agents.description,
      visibility: agents.visibility,
      creatorId: agents.creatorId,
      artifacts_enabled: agents.artifacts_enabled,
      image_url: agents.image_url,
    })
    .from(agents)
    .where(or(
      eq(agents.visibility, 'public'), // Will use the index on agents.visibility
      userId ? eq(agents.creatorId, userId) : undefined // Will use the index on agents.creatorId
    ))
    .orderBy(desc(agents.id));

    // For each agent, fetch their models and tool groups
    const agentsWithModels = await Promise.all(
      result.map(async (agent) => {
        // Fetch models
        const agentModelResults = await db.select({
          model: models,
          isDefault: agentModels.isDefault
        })
        .from(agentModels)
        .leftJoin(models, eq(agentModels.modelId, models.id)) // Will use the index on agentModels.modelId
        .where(eq(agentModels.agentId, agent.id)); // Will use the index on agentModels.agentId

        const agentModelsArray = agentModelResults
          .map(r => r.model)
          .filter((model): model is Model => model !== null);
          
        const defaultModel = agentModelResults.find(r => r.isDefault)?.model || null;

        // Fetch tool groups
        const toolGroupResults = await db.select({
          id: toolGroups.id,
          name: toolGroups.name,
          display_name: toolGroups.display_name,
          description: toolGroups.description,
        })
        .from(agentToolGroups)
        .leftJoin(toolGroups, eq(agentToolGroups.toolGroupId, toolGroups.id)) // Will use the index on agentToolGroups.toolGroupId
        .where(eq(agentToolGroups.agentId, agent.id)); // Will use the index on agentToolGroups.agentId

        const toolGroupsArray = toolGroupResults
          .filter(tg => tg.id !== null && tg.name !== null && tg.display_name !== null)
          .map(tg => ({
            ...tg,
            id: tg.id!,
            name: tg.name!,
            display_name: tg.display_name!
          }));

        if (includeAllModels) {
          return {
            ...agent,
            models: agentModelsArray,
            toolGroups: toolGroupsArray
          };
        } else {
          return {
            ...agent,
            model: defaultModel,
            toolGroups: toolGroupsArray
          };
        }
      })
    );

    return agentsWithModels;
  } catch (error) {
    console.error('Failed to get agents from database');
    throw error;
  }
}

export async function getAgentById(id: string) {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return null;
  }

  try {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  } catch (error) {
    console.error('Failed to get agent by id from database');
    throw error;
  }
}

export async function getModelById(id: string) {
  try {
    const [model] = await db.select().from(models).where(eq(models.id, id));
    return model;
  } catch (error) {
    console.error('Failed to get model by id from database');
    throw error;
  }
}

export async function createAgent({
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  creatorId,
  artifactsEnabled,
  imageUrl,
}: {
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: 'public' | 'private' | 'link';
  creatorId: string;
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
}) {
  try {
    // Generate slug from display name
    const slug = generateSlug(agentDisplayName);

    // First create the agent without a model
    const [result] = await db.insert(agents).values({
      agent: slug, // Use the generated slug
      agent_display_name: agentDisplayName,
      system_prompt: systemPrompt,
      description,
      visibility,
      creatorId,
      artifacts_enabled: artifactsEnabled ?? true,
      image_url: imageUrl,
    }).returning({ id: agents.id });

    // Then create the agent-model relationship with isDefault=true
    if (result?.id) {
      await db.insert(agentModels).values({
        agentId: result.id,
        modelId,
        isDefault: true
      });
    }

    return result;
  } catch (error) {
    console.error('Failed to create agent in database');
    throw error;
  }
}

export async function deleteAgentQuery(id: string) {
  try {
    return await db.delete(agents).where(eq(agents.id, id));
  } catch (error) {
    console.error('Failed to delete agent from database');
    throw error;
  }
}

export async function getAgentWithModelById(id: string) {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return null;
  }

  try {
    const [agent] = await db
      .select({
        agent: agents
      })
      .from(agents)
      .where(eq(agents.id, id));

    if (!agent) return null;

    // Get all models for this agent
    const agentModelResults = await db.select({
      model: models,
      isDefault: agentModels.isDefault
    })
    .from(agentModels)
    .leftJoin(models, eq(agentModels.modelId, models.id))
    .where(eq(agentModels.agentId, id));

    // Get the default model
    const defaultModel = agentModelResults.find(r => r.isDefault)?.model || null;

    return {
      agent: agent.agent,
      model: defaultModel
    };
  } catch (error) {
    console.error('Failed to get agent with model from database');
    throw error;
  }
}

export async function updateAgentById({
  id,
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  artifactsEnabled,
  imageUrl,
}: {
  id: string;
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: 'public' | 'private' | 'link';
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
}) {
  try {
    // Generate slug from display name
    const slug = generateSlug(agentDisplayName);

    // Update the agent
    await db.update(agents)
      .set({
        agent: slug, // Use the generated slug
        agent_display_name: agentDisplayName,
        system_prompt: systemPrompt,
        description,
        visibility,
        artifacts_enabled: artifactsEnabled,
        image_url: imageUrl,
      })
      .where(eq(agents.id, id));

    // Check if the agent already has this model
    const existingModels = await db.select()
      .from(agentModels)
      .where(and(
        eq(agentModels.agentId, id),
        eq(agentModels.modelId, modelId)
      ));

    if (existingModels.length === 0) {
      // If the model doesn't exist for this agent, add it
      
      // First, set all existing models to not default
      await db.update(agentModels)
        .set({ isDefault: false })
        .where(eq(agentModels.agentId, id));
      
      // Then add the new model as default
      await db.insert(agentModels).values({
        agentId: id,
        modelId,
        isDefault: true
      });
    } else {
      // If the model exists, make it the default
      // First, set all models to not default
      await db.update(agentModels)
        .set({ isDefault: false })
        .where(eq(agentModels.agentId, id));
      
      // Then set this one to default
      await db.update(agentModels)
        .set({ isDefault: true })
        .where(and(
          eq(agentModels.agentId, id),
          eq(agentModels.modelId, modelId)
        ));
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update agent in database');
    throw error;
  }
}

// Specialized function to get an agent with all model information for editing
export async function getAgentWithAllModels(id: string) {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return null;
  }

  try {
    // Get the agent
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    
    if (!agent) return null;

    // Get all models for this agent
    const agentModelResults = await db.select({
      modelId: agentModels.modelId,
      isDefault: agentModels.isDefault
    })
    .from(agentModels)
    .leftJoin(models, eq(agentModels.modelId, models.id))
    .where(eq(agentModels.agentId, id));

    // Get all tool groups for this agent
    const agentToolGroupsResults = await db.select({
      toolGroupId: agentToolGroups.toolGroupId
    })
    .from(agentToolGroups)
    .where(eq(agentToolGroups.agentId, id));

    // Extract primary model and alternate models
    const defaultModel = agentModelResults.find(m => m.isDefault === true);
    const alternateModels = agentModelResults.filter(m => m.isDefault !== true);

    return {
      ...agent,
      modelId: defaultModel?.modelId || '',
      alternateModelIds: alternateModels.map(m => m.modelId),
      toolGroupIds: agentToolGroupsResults.map(tg => tg.toolGroupId)
    };
  } catch (error) {
    console.error('Failed to get agent with models from database');
    throw error;
  }
}

// Function to get an agent with all its available models for the chat interface
export async function getAgentWithAvailableModels(id: string) {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return null;
  }

  try {
    // Get the agent
    const [agentData] = await db.select().from(agents).where(eq(agents.id, id));
    
    if (!agentData) return null;

    // Get all models for this agent
    const agentModelResults = await db.select({
      modelId: agentModels.modelId,
      isDefault: agentModels.isDefault
    })
    .from(agentModels)
    .where(eq(agentModels.agentId, id));

    // Get full model details for each agent model
    const modelDetails = await Promise.all(
      agentModelResults.map(async (modelRef) => {
        const [modelData] = await db
          .select()
          .from(models)
          .where(eq(models.id, modelRef.modelId));
        
        return modelData ? {
          ...modelData,
          isDefault: modelRef.isDefault
        } : null;
      })
    );

    // Filter out null results and sort (default first)
    const availableModels = modelDetails
      .filter((model): model is (Model & { isDefault: boolean | null }) => model !== null)
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });

    return {
      agent: agentData,
      availableModels
    };
  } catch (error) {
    console.error('Failed to get agent with available models from database');
    throw error;
  }
}

// Get all tool groups
export async function getAllToolGroups() {
  try {
    return await db.select({
      id: toolGroups.id,
      name: toolGroups.name,
      displayName: toolGroups.display_name,
      description: toolGroups.description,
    })
    .from(toolGroups)
    .orderBy(asc(toolGroups.display_name));
  } catch (error) {
    console.error('Failed to get tool groups from database');
    throw error;
  }
}

// Get tool groups for a specific agent
export async function getToolGroupsByAgentId(agentId: string) {
  try {
    const result = await db.select({
      id: toolGroups.id,
      name: toolGroups.name,
      displayName: toolGroups.display_name,
      description: toolGroups.description,
    })
    .from(agentToolGroups)
    .innerJoin(toolGroups, eq(agentToolGroups.toolGroupId, toolGroups.id))
    .where(eq(agentToolGroups.agentId, agentId));
    
    return result;
  } catch (error) {
    console.error('Failed to get tool groups for agent from database');
    throw error;
  }
}

// Get tools by tool group id
export async function getToolsByToolGroupId(toolGroupId: string) {
  try {
    const result = await db.select({
      id: tools.id,
      displayName: tools.tool_display_name,
      tool: tools.tool,
      description: tools.description,
    })
    .from(tools)
    .innerJoin(
      toolGroupTools, 
      eq(tools.id, toolGroupTools.toolId)
    )
    .where(eq(toolGroupTools.toolGroupId, toolGroupId));
    
    return result;
  } catch (error) {
    console.error('Failed to get tools by tool group id from database');
    throw error;
  }
}

export async function searchChatsByContent({ 
  userId, 
  searchTerm 
}: { 
  userId: string; 
  searchTerm: string;
}) {
  if (!searchTerm.trim()) {
    return await getChatsByUserId({ id: userId });
  }

  try {
    // Will use the index on chat.userId and join will use message.chatId index
    const matchingMessages = await db
      .select({
        messageId: message.id,
        chatId: message.chatId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt
      })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, userId), // Uses the index on chat.userId
          or(
            sql`CAST(${message.content} AS TEXT) ILIKE ${'%' + searchTerm + '%'}`,
            sql`CAST(${message.content}->>'text' AS TEXT) ILIKE ${'%' + searchTerm + '%'}`,
            sql`CAST(${message.content}->>'value' AS TEXT) ILIKE ${'%' + searchTerm + '%'}`,
            sql`CAST(${message.content}->>'content' AS TEXT) ILIKE ${'%' + searchTerm + '%'}`
          )
        )
      );

    // If no message matches, fallback to chat title and agent name search
    if (matchingMessages.length === 0) {
      return await db
        .select({
          id: chat.id,
          createdAt: chat.createdAt,
          title: chat.title,
          userId: chat.userId,
          agentId: chat.agentId,
          visibility: chat.visibility,
          agentDisplayName: agents.agent_display_name
        })
        .from(chat)
        .leftJoin(agents, eq(chat.agentId, agents.id))
        .where(
          and(
            eq(chat.userId, userId),
            or(
              sql`${chat.title} ILIKE ${'%' + searchTerm + '%'}`,
              sql`${agents.agent_display_name} ILIKE ${'%' + searchTerm + '%'}`
            )
          )
        )
        .orderBy(desc(chat.createdAt));
    }

    // STEP 2: Process the matching messages
    // Count occurrences per chat and extract snippets
    const chatMatches: Record<string, { 
      count: number; 
      snippets: Array<{ text: string; messageId: string }>
    }> = {};

    matchingMessages.forEach(msg => {
      // Get the chatId to group by
      const chatId = msg.chatId;
      
      // Initialize chat entry if not exists
      if (!chatMatches[chatId]) {
        chatMatches[chatId] = { count: 0, snippets: [] };
      }

      // Extract content text from the message JSON
      let contentText = '';
      
      if (typeof msg.content === 'object' && msg.content !== null) {
        // Method 1: Try common JSON patterns
        if ('text' in msg.content && msg.content.text) {
          contentText = String(msg.content.text);
        } else if ('value' in msg.content && msg.content.value) {
          contentText = String(msg.content.value);
        } else if ('content' in msg.content && msg.content.content) {
          contentText = String(msg.content.content);
        } 
        // Method 2: If still no content, try stringifying the entire object
        else {
          try {
            contentText = JSON.stringify(msg.content);
          } catch (e) {
            // If stringify fails, use an empty string
            contentText = '';
          }
        }
      } else if (typeof msg.content === 'string') {
        contentText = msg.content;
      }

      // Skip if no extractable content
      if (!contentText) return;

      // Increment match count for this chat
      chatMatches[chatId].count++;

      // Extract snippet with context (limit to first 3 snippets per chat)
      if (chatMatches[chatId].snippets.length < 3) {
        const lowerContent = contentText.toLowerCase();
        const lowerTerm = searchTerm.toLowerCase();
        const index = lowerContent.indexOf(lowerTerm);

        if (index >= 0) {
          // Create snippet with some context
          const start = Math.max(0, index - 40);
          const end = Math.min(contentText.length, index + searchTerm.length + 40);
          let snippet = contentText.substring(start, end);

          // Add ellipsis if needed
          if (start > 0) snippet = '...' + snippet;
          if (end < contentText.length) snippet = snippet + '...';

          chatMatches[chatId].snippets.push({
            text: snippet,
            messageId: msg.messageId
          });
        }
      }
    });

    // STEP 3: Get complete chat data for all the matching chat IDs
    const matchingChatIds = Object.keys(chatMatches);
    
    if (matchingChatIds.length === 0) {
      return [];
    }


    const chatsWithAgents = await db
      .select({
        id: chat.id,
        createdAt: chat.createdAt,
        title: chat.title,
        userId: chat.userId,
        agentId: chat.agentId,
        visibility: chat.visibility,
        agentDisplayName: agents.agent_display_name
      })
      .from(chat)
      .leftJoin(agents, eq(chat.agentId, agents.id))
      .where(inArray(chat.id, matchingChatIds));
    
    // STEP 4: Combine the chat data with match information and sort by match count
    const result = chatsWithAgents.map(chat => ({
      ...chat,
      matchCount: chatMatches[chat.id]?.count || 0,
      matchSnippets: chatMatches[chat.id]?.snippets || []
    })).sort((a, b) => b.matchCount - a.matchCount);

    return result;
  } catch (error) {
    console.error('Failed to search chats by content', error);
    throw error;
  }
}

export async function getUserTokenUsage(userId: string) {
  try {
    // Fetch all messages from user's chats with token usage and model information
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));
    
    const chatIds = userChats.map(chat => chat.id);
    
    if (chatIds.length === 0) {
      return [];
    }
    
    // Get all messages with token usage and model_id from these chats
    const messagesWithTokens = await db
      .select({
        role: message.role,
        tokenUsage: message.token_usage,
        modelId: message.model_id,
      })
      .from(message)
      .where(
        and(
          inArray(message.chatId, chatIds),
          isNotNull(message.token_usage)
        )
      );
    
    // If no messages with token usage, return empty array
    if (messagesWithTokens.length === 0) {
      return [];
    }
    
    // Get unique model IDs from messages
    const modelIds = Array.from(
      new Set(
        messagesWithTokens
          .filter(msg => msg.modelId !== null)
          .map(msg => msg.modelId)
      )
    ) as string[];
    
    // Fetch model information for these model IDs
    let modelsData: Array<{
      id: string;
      modelName: string;
      provider: string | null;
      costPerMillionInputTokens: number | null;
      costPerMillionOutputTokens: number | null;
    }> = [];
    
    if (modelIds.length > 0) {
      const rawModelsData = await db
        .select({
          id: models.id,
          modelName: models.model_display_name,
          provider: models.provider,
          costPerMillionInputTokens: models.cost_per_million_input_tokens,
          costPerMillionOutputTokens: models.cost_per_million_output_tokens
        })
        .from(models)
        .where(inArray(models.id, modelIds));
      
      // Convert string values to numbers
      modelsData = rawModelsData.map(model => ({
        id: model.id,
        modelName: model.modelName,
        provider: model.provider,
        costPerMillionInputTokens: model.costPerMillionInputTokens ? Number(model.costPerMillionInputTokens) : null,
        costPerMillionOutputTokens: model.costPerMillionOutputTokens ? Number(model.costPerMillionOutputTokens) : null
      }));
    }
    
    // Create a map of model ID to model info
    const modelInfoMap = new Map();
    modelsData.forEach(model => {
      modelInfoMap.set(model.id, {
        modelName: model.modelName,
        provider: model.provider,
        costPerMillionInputTokens: model.costPerMillionInputTokens,
        costPerMillionOutputTokens: model.costPerMillionOutputTokens
      });
    });
    
    // Prepare data structure for token usage by model
    const tokenUsageByModel = new Map();
    
    // Default "unknown model" for messages without model info
    tokenUsageByModel.set('unknown', {
      modelName: 'Unknown Model',
      provider: '',
      inputTokens: 0,
      outputTokens: 0,
      costPerMillionInputTokens: null,
      costPerMillionOutputTokens: null,
      cost: 0
    });
    
    // Process each message and attribute to the right model
    messagesWithTokens.forEach(message => {
      if (!message.tokenUsage) return;
      
      let modelKey = 'unknown';
      let modelName = 'Unknown Model';
      let provider = '';
      
      // If we can determine the model, use it
      if (message.modelId && modelInfoMap.has(message.modelId)) {
        modelKey = message.modelId;
        const modelInfo = modelInfoMap.get(message.modelId);
        modelName = modelInfo.modelName;
        provider = modelInfo.provider;
      }
      
      // Initialize model data if not exists
      if (!tokenUsageByModel.has(modelKey)) {
        const modelInfo = modelInfoMap.get(modelKey) || {};
        tokenUsageByModel.set(modelKey, {
          modelName,
          provider,
          inputTokens: 0,
          outputTokens: 0,
          costPerMillionInputTokens: modelInfo.costPerMillionInputTokens || null,
          costPerMillionOutputTokens: modelInfo.costPerMillionOutputTokens || null,
          cost: 0
        });
      }
      
      // Add token usage to appropriate category
      const modelData = tokenUsageByModel.get(modelKey);
      if (message.role === 'user') {
        modelData.inputTokens += message.tokenUsage;
      } else {
        modelData.outputTokens += message.tokenUsage;
      }
    });
    
    // Calculate costs for each model
    tokenUsageByModel.forEach((modelData) => {
      const inputCost = modelData.costPerMillionInputTokens 
        ? (modelData.inputTokens / 1000000) * Number(modelData.costPerMillionInputTokens) 
        : 0;
      
      const outputCost = modelData.costPerMillionOutputTokens 
        ? (modelData.outputTokens / 1000000) * Number(modelData.costPerMillionOutputTokens) 
        : 0;
      
      modelData.cost = inputCost + outputCost;
    });
    
    // Convert map to array and sort by total usage
    const result = Array.from(tokenUsageByModel.values())
      .filter(model => model.inputTokens > 0 || model.outputTokens > 0)
      .sort((a, b) => 
        (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens)
      );
    
    return result;
  } catch (error) {
    console.error('Failed to get user token usage from database', error);
    return []; // Return empty array instead of throwing
  }
}

export async function getUserTransactions(
  userId: string, 
  page = 1, 
  pageSize = 10,
  type: "usage" | "purchase" | "refund" | "promotional" | "adjustment" | null = null,
  startDate: string | null = null,
  endDate: string | null = null
) {
  try {
    // Calculate offset based on page number and page size
    const offset = (page - 1) * pageSize;
    
    // Build the base condition with user ID
    let conditions = [eq(userTransactions.userId, userId)];
    
    // Add type filter if provided
    if (type) {
      conditions.push(eq(userTransactions.type, type));
    }
    
    // Add date range filters if provided
    if (startDate) {
      const startDateObj = new Date(startDate);
      conditions.push(gte(userTransactions.created_at, startDateObj));
    }
    
    if (endDate) {
      // Set the end date to the end of the day (23:59:59)
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      conditions.push(sql`${userTransactions.created_at} <= ${endDateObj}`);
    }
    
    // Combine all conditions with AND
    const whereConditions = and(...conditions);
    
    // First, get the total count of transactions for pagination with filters
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userTransactions)
      .where(whereConditions);
    
    const totalCount = totalCountResult[0]?.count || 0;
    
    // Get the transactions with message content if available, applying the same filters
    const transactions = await db
      .select({
        id: userTransactions.id,
        amount: userTransactions.amount,
        type: userTransactions.type,
        description: userTransactions.description,
        created_at: userTransactions.created_at,
        messageId: userTransactions.messageId,
        messageContent: message.content,
      })
      .from(userTransactions)
      .leftJoin(message, eq(userTransactions.messageId, message.id))
      .where(whereConditions)
      .orderBy(desc(userTransactions.created_at))
      .limit(pageSize)
      .offset(offset);
    
    return {
      transactions,
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize)
    };
  } catch (error) {
    console.error('Failed to get user transactions:', error);
    return {
      transactions: [],
      totalCount: 0,
      pageCount: 0
    };
  }
}
