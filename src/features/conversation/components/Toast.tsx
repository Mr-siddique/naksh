import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MOTION } from '../../../theme/motion';
import { radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import { useConversationStore } from '../store/useConversationStore';

export function Toast() {
  const { colors } = useTheme();
  const message = useConversationStore(s => s.toast);

  useEffect(() => {
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(MOTION.fast)}
      exiting={FadeOut.duration(MOTION.fast)}
      style={[styles.toast, { backgroundColor: colors.text }]}
    >
      <Text style={[styles.text, { color: colors.background }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: spacing.md,
    pointerEvents: 'none',
    alignSelf: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
