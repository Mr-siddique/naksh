import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { FADE_IN_DOWN, FADE_OUT_DOWN } from '../../../theme/motion';
import { MIN_TOUCH, radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import { AI_SENDER } from '../constants';
import type { ReplyRef } from '../conversation.types';
import { truncate } from '../utils/truncate';

type ReplyPreviewProps = {
  reply: ReplyRef;
  onClose: () => void;
};

export function ReplyPreview({ reply, onClose }: ReplyPreviewProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FADE_IN_DOWN}
      exiting={FADE_OUT_DOWN}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: colors.primary }]} />
      <View
        style={styles.body}
        accessible
        accessibilityLabel={`Replying to ${AI_SENDER}: ${truncate(
          reply.text,
          80,
        )}`}
      >
        <Text style={[styles.title, { color: colors.primary }]}>
          {`Replying to ${AI_SENDER}`}
        </Text>
        <Text
          style={[styles.text, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {reply.text}
        </Text>
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
        style={styles.close}
      >
        <Text style={[styles.closeIcon, { color: colors.textMuted }]}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    marginTop: 2,
  },
  close: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 22,
  },
});
