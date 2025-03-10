'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { Agent, Vote, AgentCustomization } from '@/lib/db/schema';
import { useLocalStorage } from 'usehooks-ts';

import { ChatHeader } from '@/components/chat/chat-header';
import { convertToUIMessages, fetcher, generateUUID } from '@/lib/utils';
import { MultimodalInput } from '@/components/chat/multimodal-input';
import { Messages } from '@/components/chat/messages';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { ModelWithDefault } from './chat-model-selector';
import { VisibilityType } from '../util/visibility-selector';
import { Artifact } from '../artifact/artifact';


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
  
  // Use localStorage to persist search enabled state
  const [searchEnabledStorage, setSearchEnabledStorage] = useLocalStorage<boolean>('search-enabled', false);
  const [searchEnabled, setSearchEnabled] = useState<boolean>(searchEnabledStorage);
  
  // Update localStorage when searchEnabled changes
  useEffect(() => {
    setSearchEnabledStorage(searchEnabled);
  }, [searchEnabled, setSearchEnabledStorage]);

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
    data: toolCallData,
    addToolResult
  } = useChat({
    id,
    body: { 
      id, 
      selectedChatModel: modelIdentifier, // The model name/identifier for the AI request
      selectedModelId: currentModel, // The actual database model ID for saving
      agentId: agent.id,
      agentSystemPrompt: agent?.system_prompt,
      searchEnabled // Pass the search toggle state to the API
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');

      fetch(`/api/chat/messages?chatId=${id}`)
      .then(res => res.json())
      .then(latestMessages => {
        // Update the messages with token usage information
        setMessages(convertToUIMessages(latestMessages));
      });
  
    },
    onError: (error) => {
      // Extract the error message or use a fallback
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'An error occurred, please try again!';
      
      toast.error(errorMessage);
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
            toolCallData={toolCallData}
            addToolResult={addToolResult}
            customization={agent.customization as AgentCustomization}
          />
        </div>

        <form className="flex flex-col mx-auto px-2 sm:px-4 bg-background pb-1 sm:pb-2 md:pb-4 gap-1 sm:gap-2 w-full md:max-w-3xl">
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
              availableModels={availableModels}
              currentModel={currentModel}
              onModelChange={handleModelChange}
              isReadonly={isReadonly}
              searchEnabled={searchEnabled}
              setSearchEnabled={setSearchEnabled}
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
        searchEnabled={searchEnabled}
        setSearchEnabled={setSearchEnabled}
      />
    </>
  );
}
