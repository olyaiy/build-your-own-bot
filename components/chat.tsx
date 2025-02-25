'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { Agent, Model } from '@/lib/db/schema';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { ChatModelSelector, type ModelWithDefault } from '@/components/chat-model-selector';

export function Chat({
  id,
  agent,
  availableModels = [],
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  agent: Agent;
  availableModels?: ModelWithDefault[];
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [currentModel, setCurrentModel] = useState<string>(selectedChatModel);

  // Find the selected model details
  const selectedModelDetails = availableModels.find(model => model.id === currentModel);
  const modelIdentifier = selectedModelDetails?.model || selectedChatModel;

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { 
      id, 
      selectedChatModel: modelIdentifier, // Send the actual model identifier to the API
      agentId: agent.id,
      agentSystemPrompt: agent?.system_prompt
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      toast.error('An error occured, please try again!');
    },
  });

  // Voting Routes and Updates
  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Handler for changing the model
  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    // We don't need to update the chat - next message will use the new model
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh overflow-hidden bg-background">
        <ChatHeader
          chatId={id}
          agentId={agent.id}
          selectedModelId={currentModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <div className="flex-1 min-h-0 relative">
          <Messages
            chatId={id}
            isLoading={isLoading}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isArtifactVisible={isArtifactVisible}
          />
        </div>

        <form className="flex flex-col mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {/* Model Selector */}
          <ChatModelSelector
            isReadonly={isReadonly}
            availableModels={availableModels}
            currentModel={currentModel}
            onModelChange={handleModelChange}
          />

          {!isReadonly && (
            <MultimodalInput
              agentId={agent.id}
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        agentId={agent.id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
