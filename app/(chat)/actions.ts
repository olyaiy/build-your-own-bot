'use server';

import { generateText, Message, streamObject } from 'ai';
import { cookies } from 'next/headers';
import { groq } from '@ai-sdk/groq';
import { auth } from '@/app/(auth)/auth';
import crypto from 'crypto';
import { z } from 'zod';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';

import { myProvider } from '@/lib/ai/models';
import { VisibilityType } from '@/components/util/visibility-selector';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  try {
    const modelToUse = myProvider.languageModel('title-model');


    const { text: title } = await generateText({
      model: modelToUse,
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });

    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    
    // Type the error object properties that we want to access
    const typedError = error as {
      message?: string;
      statusCode?: number;
      responseBody?: unknown;
      url?: string;
    };
    
    console.error('Error details:', {
      modelName: 'title-model',
      errorMessage: typedError.message,
      statusCode: typedError.statusCode,
      responseBody: typedError.responseBody,
      url: typedError.url
    });
    
    // Return first 80 characters of the message content as fallback title
    return JSON.stringify(message) || "New Chat";
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function duplicateChat(chatId: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error('You must be signed in to duplicate a chat');
  }

  try {
    // Get the original chat
    const originalChat = await getChatById({ id: chatId });
    
    if (!originalChat) {
      throw new Error('Chat not found');
    }

    if (!originalChat.agentId) {
      throw new Error('Chat has no associated agent');
    }

    // Get all messages from the original chat
    const originalMessages = await getMessagesByChatId({ id: chatId });
    
    // Create a new chat with the same title and agent
    const newChatId = crypto.randomUUID();
    const userId = session.user.id;
    
    await saveChat({
      id: newChatId,
      userId,
      title: `${originalChat.title} (copy)`,
      agentId: originalChat.agentId,
    });
    
    // Duplicate all messages for the new chat
    if (originalMessages.length > 0) {
      const newMessages = originalMessages.map((msg) => ({
        ...msg,
        id: crypto.randomUUID(),
        chatId: newChatId,
        createdAt: new Date(),
      }));
      
      await saveMessages({ messages: newMessages });
    }
    
    return { 
      success: true,
      newChatId,
      agentId: originalChat.agentId
    };
  } catch (error) {
    console.error('Error duplicating chat:', error);
    throw new Error('Failed to duplicate chat');
  }
}

export async function generatePromptSuggestion({
  title,
  description,
  count = 1,
  existingPrompts = []
}: {
  title: string;
  description?: string;
  count?: number;
  existingPrompts?: string[];
}) {
  try {
    const modelToUse = myProvider.languageModel('title-model');
    
    const context = {
      title,
      description: description || '',
      count: Math.min(Math.max(1, count), 4), // Ensure count is between 1 and 4
      existingPrompts
    };

    const { elementStream } = await streamObject({
      model: modelToUse,
      output: 'array',
      schema: z.object({
        suggestion: z.string().describe('The suggested prompt for the AI agent'),
        relevance: z.number().min(0).max(1).describe('How relevant this suggestion is to the agent\'s purpose (0-1)'),
        category: z.string().describe('The category or type of this suggestion (e.g. question, task, exploration)')
      }),
      system: `You are a helpful AI that generates engaging prompt suggestions for AI agents.
      Based on the agent's title and description, generate ${context.count} interesting prompts that a user might want to ask this agent.
      
      ${existingPrompts.length > 0 ? `
      Consider these existing prompts and generate suggestions that are complementary and diverse:
      ${existingPrompts.map(p => `- ${p}`).join('\n')}
      ` : ''}

      Each prompt should:
      - Be relevant to the agent's purpose and capabilities
      - Be specific and actionable
      - Be between 30-80 characters
      - Not use quotes or special characters
      - Be phrased as a question or request
      - Be engaging and encourage interaction
      - Be different from existing prompts
      - Cover different aspects or use cases

      If you're unsure about the agent's specific capabilities based on the title/description:
      - Generate general but useful questions that would work for any AI agent
      - Focus on understanding the agent's capabilities
      - Ask about features and use cases
      - Include questions about customization and preferences
      - Ask about limitations and best practices
      
      For each suggestion, also provide:
      - A relevance score (0-1) indicating how well it matches the agent's purpose
      - A category for the type of suggestion`,
      prompt: JSON.stringify(context),
    });

    const suggestions: Array<{
      suggestion: string;
      relevance: number;
      category: string;
    }> = [];

    try {
      for await (const element of elementStream) {
        suggestions.push(element);
        if (suggestions.length >= context.count) break;
      }
    } catch (streamError) {
      console.error('Error in suggestion stream:', streamError);
    }

    // Return just the suggestion strings if we have them
    if (suggestions.length > 0) {
      return suggestions.map(s => s.suggestion);
    }

    // Fallback to general suggestions
    return [
      "What are your main capabilities?",
      "How can I customize your responses?",
      "What are your limitations?",
      "Show me some example tasks"
    ].slice(0, count);
  } catch (error) {
    console.error('Error generating prompt suggestions:', error);
    
    const typedError = error as {
      message?: string;
      statusCode?: number;
      responseBody?: unknown;
      url?: string;
    };
    
    console.error('Error details:', {
      modelName: 'title-model',
      errorMessage: typedError.message,
      statusCode: typedError.statusCode,
      responseBody: typedError.responseBody,
      url: typedError.url
    });
    
    // Return general suggestions instead of just one
    return [
      "What are your main capabilities?",
      "How can I customize your responses?",
      "What are your limitations?",
      "Show me some example tasks"
    ].slice(0, count);
  }
}