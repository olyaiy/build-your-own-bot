'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';
import { groq } from '@ai-sdk/groq';
import { auth } from '@/app/(auth)/auth';
import crypto from 'crypto';

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

    // Truncate message content to 5000 characters if needed
    const truncatedMessage = {
      ...message,
      content: message.content.slice(0, 5000)
    };
    
    const { text: title } = await generateText({
      model: modelToUse,
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(truncatedMessage),
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
    return message.content.slice(0, 80) || "New Chat";
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
