import { Vote } from '@/lib/db/schema';
import { Message } from 'ai';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { UIArtifact } from './artifact';
import { PreviewMessage } from '../chat/message';
import { useScrollToBottom } from '../hooks/use-scroll-to-bottom';
import { UseChatHelpers } from 'ai/react';

interface ArtifactMessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  artifactStatus: UIArtifact['status'];
  isCompact?: boolean;
}

function PureArtifactMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isCompact = true,
}: ArtifactMessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col gap-4 size-full overflow-y-scroll overflow-x-hidden px-0 min-w-0 "
    >
      <div className="px-4 flex flex-col items-stretch  gap-8 ">
        {messages.map((message, index) => (
          <div key={message.id} className=" relative overflow-hidden ">
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={status === 'streaming' && index === messages.length - 1}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              isCompact={isCompact}
            />
          </div>
        ))}
      </div>

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px] "
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

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.isCompact !== nextProps.isCompact) return false;

  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
