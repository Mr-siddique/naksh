import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  DISABLED_OPACITY,
  MIN_TOUCH,
  radius,
  spacing,
} from '../../../theme/spacing';
import { MOTION } from '../../../theme/motion';
import { useTheme } from '../../../theme/useTheme';
import {
  selectIsBusy,
  useConversationStore,
} from '../store/useConversationStore';
import { ReplyPreview } from './ReplyPreview';

type ComposerProps = {
  onSent?: () => void;
};

const INPUT_LINE_HEIGHT = 20;
const INPUT_MAX_LINES = 5;

export function Composer({ onSent }: ComposerProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const isBusy = useConversationStore(selectIsBusy);
  const sendMessage = useConversationStore(s => s.sendMessage);
  const replyTo = useConversationStore(s => s.replyTo);
  const clearReply = useConversationStore(s => s.clearReply);

  useEffect(() => {
    if (!replyTo) {
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), MOTION.fast);
    return () => clearTimeout(timer);
  }, [replyTo]);

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
    <View>
      {replyTo ? <ReplyPreview reply={replyTo} onClose={clearReply} /> : null}
      <View
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
          replyTo && styles.noTopBorder,
        ]}
      >
        <TextInput
          ref={inputRef}
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
  noTopBorder: {
    borderTopWidth: 0,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
