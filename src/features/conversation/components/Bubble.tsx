import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MESSAGE_GUTTER, radius, spacing } from '../../../theme/spacing';
import { AI_SENDER } from '../constants';
import { truncate } from '../utils/truncate';
import { ReplyQuote } from './ReplyQuote';

type BubbleProps = {
  align: 'left' | 'right';
  sender: string;
  senderColor?: string;
  backgroundColor: string;
  borderColor?: string;
  isGrouped: boolean;
  text: string;
  textColor: string;
  quote?: string;
  onLongPress?: () => void;
  children?: ReactNode;
};

const LONG_PRESS_ACTIONS = [{ name: 'longpress', label: 'Message actions' }];

export function Bubble({
  align,
  sender,
  senderColor,
  backgroundColor,
  borderColor,
  isGrouped,
  text,
  textColor,
  quote,
  onLongPress,
  children,
}: BubbleProps) {
  const bubbleProps = {
    testID: 'message-bubble',
    accessible: true,
    accessibilityLabel: quote
      ? `${sender}, replying to ${AI_SENDER}, "${truncate(quote, 80)}": ${text}`
      : `${sender}: ${text}`,
    style: [
      styles.bubble,
      { backgroundColor },
      borderColor
        ? { borderColor, borderWidth: StyleSheet.hairlineWidth }
        : null,
    ],
  };
  const content = (
    <>
      {quote ? <ReplyQuote text={quote} color={textColor} /> : null}
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </>
  );

  return (
    <View
      testID="message-row"
      style={[
        styles.row,
        align === 'right' ? styles.right : styles.left,
        isGrouped ? styles.grouped : styles.lead,
      ]}
    >
      {senderColor && !isGrouped && (
        <Text
          style={[styles.sender, { color: senderColor }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {sender}
        </Text>
      )}
      {onLongPress ? (
        <Pressable
          {...bubbleProps}
          onLongPress={onLongPress}
          accessibilityActions={LONG_PRESS_ACTIONS}
          accessibilityHint="Long-press for actions"
          onAccessibilityAction={event => {
            if (event.nativeEvent.actionName === 'longpress') {
              onLongPress();
            }
          }}
        >
          {content}
        </Pressable>
      ) : (
        <View {...bubbleProps}>{content}</View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: MESSAGE_GUTTER,
  },
  left: {
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  lead: {
    marginTop: spacing.md,
  },
  grouped: {
    marginTop: spacing.xs / 2,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});
