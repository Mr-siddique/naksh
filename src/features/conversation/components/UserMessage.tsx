import { useTheme } from '../../../theme/useTheme';
import type { UserMessage as UserMessageType } from '../conversation.types';
import { Bubble } from './Bubble';

type UserMessageProps = {
  message: UserMessageType;
  isGrouped: boolean;
  showSentStatus: boolean;
};

export function UserMessage({ message, isGrouped }: UserMessageProps) {
  const { colors } = useTheme();

  return (
    <Bubble
      align="right"
      sender="You"
      backgroundColor={colors.userBubble}
      isGrouped={isGrouped}
      text={message.text}
      textColor={colors.onUserBubble}
    />
  );
}
