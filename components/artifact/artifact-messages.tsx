import { Vote } from '@/lib/db/schema';
import { ChatRequestOptions, Message } from 'ai';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { UIArtifact } from './artifact';
import { PreviewMessage } from '../chat/message';
import { useScrollToBottom } from '../hooks/use-scroll-to-bottom';

interface ArtifactMessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  artifactStatus: UIArtifact['status'];
}

function PureArtifactMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: ArtifactMessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col gap-4 h-full w-full overflow-y-scroll overflow-x-hidden px-4 pt-20 min-w-0"
    >
      <div className="w-full flex flex-col items-stretch max-w-full">
        {messages.map((message, index) => (
          <div key={message.id} className="w-full overflow-hidden">
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={isLoading && index === messages.length - 1}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
            />
          </div>
        ))}
      </div>

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps,
) {
  if (
    prevProps.artifactStatus === 'streaming' &&
    nextProps.artifactStatus === 'streaming'
  )
    return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
