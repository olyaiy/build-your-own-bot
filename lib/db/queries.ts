import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { generateSlug } from '@/lib/utils';

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
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
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

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
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
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
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
      eq(agents.visibility, 'public'),
      userId ? eq(agents.creatorId, userId) : undefined
    ))
    .orderBy(desc(agents.id));

    // For each agent, fetch their models
    const agentsWithModels = await Promise.all(
      result.map(async (agent) => {
        const agentModelResults = await db.select({
          model: models,
          isDefault: agentModels.isDefault
        })
        .from(agentModels)
        .leftJoin(models, eq(agentModels.modelId, models.id))
        .where(eq(agentModels.agentId, agent.id));

        const agentModelsArray = agentModelResults
          .map(r => r.model)
          .filter((model): model is Model => model !== null);
          
        const defaultModel = agentModelResults.find(r => r.isDefault)?.model || null;

        if (includeAllModels) {
          return {
            ...agent,
            models: agentModelsArray
          };
        } else {
          return {
            ...agent,
            model: defaultModel
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

    // Extract primary model and alternate models
    const defaultModel = agentModelResults.find(m => m.isDefault === true);
    const alternateModels = agentModelResults.filter(m => m.isDefault !== true);

    return {
      ...agent,
      modelId: defaultModel?.modelId || '',
      alternateModelIds: alternateModels.map(m => m.modelId)
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
