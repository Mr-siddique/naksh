import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DISABLED_OPACITY, MIN_TOUCH, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import type { UserMessage as UserMessageType } from '../conversation.types';
import {
  selectIsBusy,
  useConversationStore,
} from '../store/useConversationStore';
import { Bubble } from './Bubble';

type UserMessageProps = {
  message: UserMessageType;
  isGrouped: boolean;
  showSentStatus: boolean;
};

function FailedStatus({ id }: { id: string }) {
  const { colors } = useTheme();
  const isBusy = useConversationStore(selectIsBusy);
  const retryMessage = useConversationStore(s => s.retryMessage);

  return (
    <View style={styles.status}>
      <Text style={[styles.statusText, { color: colors.danger }]}>Failed</Text>
      <Text style={[styles.statusText, { color: colors.textMuted }]}>·</Text>
      <Pressable
        onPress={() => {
          retryMessage(id);
        }}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Retry sending"
        accessibilityState={{ disabled: isBusy }}
        style={[styles.retry, isBusy && styles.disabled]}
      >
        <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
      </Pressable>
    </View>
  );
}

export function UserMessage({
  message,
  isGrouped,
  showSentStatus,
}: UserMessageProps) {
  const { colors } = useTheme();
  const { status } = message;

  let statusView = null;
  if (status === 'failed') {
    statusView = <FailedStatus id={message.id} />;
  } else if (status === 'sending' || (status === 'sent' && showSentStatus)) {
    statusView = (
      <Text
        style={[styles.status, styles.statusText, { color: colors.textMuted }]}
      >
        {status === 'sending' ? 'Sending…' : 'Sent'}
      </Text>
    );
  }

  return (
    <Bubble
      align="right"
      sender="You"
      backgroundColor={colors.userBubble}
      isGrouped={isGrouped}
      text={message.text}
      textColor={colors.onUserBubble}
      quote={message.replyTo?.text}
    >
      {statusView}
    </Bubble>
  );
}

const styles = StyleSheet.create({
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  statusText: {
    fontSize: 12,
  },
  retry: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    marginVertical: -(MIN_TOUCH - 16) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
