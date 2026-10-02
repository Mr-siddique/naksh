import { memo } from 'react';
import type { Message } from '../conversation.types';
import { AiMessage } from './AiMessage';
import { HumanMessage } from './HumanMessage';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';

type MessageRowProps = {
  message: Message;
  isGrouped: boolean;
  showSentStatus: boolean;
};

function MessageRowView({
  message,
  isGrouped,
  showSentStatus,
}: MessageRowProps) {
  switch (message.type) {
    case 'user':
      return (
        <UserMessage
          message={message}
          isGrouped={isGrouped}
          showSentStatus={showSentStatus}
        />
      );
    case 'ai':
      return <AiMessage message={message} isGrouped={isGrouped} />;
    case 'human':
      return <HumanMessage message={message} isGrouped={isGrouped} />;
    case 'system':
      return <SystemMessage message={message} />;
    default:
      message satisfies never;
      return null;
  }
}

export const MessageRow = memo(MessageRowView);
