import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FADE_IN } from '../../../theme/motion';
import { useTheme } from '../../../theme/useTheme';
import { AI_SENDER } from '../constants';
import type { AiMessage as AiMessageType } from '../conversation.types';
import { RecommendationRow } from '../recommendations/RecommendationRow';
import { useConversationStore } from '../store/useConversationStore';
import { Bubble } from './Bubble';
import { FeedbackBar } from './FeedbackBar';
import { StreamingText } from './StreamingText';

type AiMessageProps = {
  message: AiMessageType;
  isGrouped: boolean;
};

export function AiMessage({ message, isGrouped }: AiMessageProps) {
  const { colors } = useTheme();
  const openActions = useConversationStore(s => s.openActions);
  const isStreaming = useConversationStore(
    s => s.streaming?.messageId === message.id,
  );
  const [hasStreamed, setHasStreamed] = useState(isStreaming);
  if (isStreaming && !hasStreamed) {
    setHasStreamed(true);
  }

  return (
    <Bubble
      align="left"
      sender={AI_SENDER}
      senderColor={colors.primary}
      backgroundColor={colors.aiBubble}
      borderColor={colors.border}
      isGrouped={isGrouped}
      text={message.text}
      createdAt={message.createdAt}
      textColor={colors.text}
      renderText={
        isStreaming
          ? style => (
              <StreamingText
                messageId={message.id}
                text={message.text}
                style={style}
                color={colors.primary}
              />
            )
          : undefined
      }
      onLongPress={isStreaming ? undefined : () => openActions(message.id)}
    >
      {isStreaming ? null : (
        <Animated.View
          entering={hasStreamed ? FADE_IN : undefined}
          style={styles.extras}
        >
          <RecommendationRow
            messageId={message.id}
            recommendations={message.recommendations}
          />
          <FeedbackBar messageId={message.id} feedback={message.feedback} />
        </Animated.View>
      )}
    </Bubble>
  );
}

const styles = StyleSheet.create({
  extras: {
    alignSelf: 'stretch',
  },
});
