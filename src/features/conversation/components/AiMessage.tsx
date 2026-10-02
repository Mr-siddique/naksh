import { useTheme } from '../../../theme/useTheme';
import type { AiMessage as AiMessageType } from '../conversation.types';
import { RecommendationRow } from '../recommendations/RecommendationRow';
import { useConversationStore } from '../store/useConversationStore';
import { Bubble } from './Bubble';

type AiMessageProps = {
  message: AiMessageType;
  isGrouped: boolean;
};

export function AiMessage({ message, isGrouped }: AiMessageProps) {
  const { colors } = useTheme();
  const openActions = useConversationStore(s => s.openActions);

  return (
    <Bubble
      align="left"
      sender="AI Astrologer"
      senderColor={colors.primary}
      backgroundColor={colors.aiBubble}
      borderColor={colors.border}
      isGrouped={isGrouped}
      text={message.text}
      textColor={colors.text}
      onLongPress={() => openActions(message.id)}
    >
      <RecommendationRow
        messageId={message.id}
        recommendations={message.recommendations}
      />
    </Bubble>
  );
}
