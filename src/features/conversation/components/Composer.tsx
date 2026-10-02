import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  DISABLED_OPACITY,
  MIN_TOUCH,
  radius,
  spacing,
} from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import {
  selectIsBusy,
  useConversationStore,
} from '../store/useConversationStore';

type ComposerProps = {
  onSent?: () => void;
};

const INPUT_LINE_HEIGHT = 20;
const INPUT_MAX_LINES = 5;

export function Composer({ onSent }: ComposerProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const isBusy = useConversationStore(selectIsBusy);
  const sendMessage = useConversationStore(s => s.sendMessage);
  const canSend = text.trim().length > 0 && !isBusy;

  const handleSend = () => {
    if (!canSend) {
      return;
    }
    sendMessage(text);
    setText('');
    onSent?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Ask the AI Astrologer…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Message"
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.text },
        ]}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled: !canSend }}
        style={[
          styles.send,
          { backgroundColor: colors.primary },
          !canSend && styles.disabled,
        ]}
      >
        <Text
          style={[styles.sendIcon, { color: colors.onPrimary }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          ↑
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH,
    maxHeight: INPUT_LINE_HEIGHT * INPUT_MAX_LINES + spacing.md * 2,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    lineHeight: INPUT_LINE_HEIGHT,
  },
  send: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
