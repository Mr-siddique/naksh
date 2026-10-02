import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MESSAGE_GUTTER, radius, spacing } from '../../../theme/spacing';

type BubbleProps = {
  align: 'left' | 'right';
  sender: string;
  senderColor?: string;
  backgroundColor: string;
  borderColor?: string;
  isGrouped: boolean;
  text: string;
  textColor: string;
  children?: ReactNode;
};

export function Bubble({
  align,
  sender,
  senderColor,
  backgroundColor,
  borderColor,
  isGrouped,
  text,
  textColor,
  children,
}: BubbleProps) {
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
      <View
        testID="message-bubble"
        accessible
        accessibilityLabel={`${sender}: ${text}`}
        style={[
          styles.bubble,
          { backgroundColor },
          borderColor
            ? { borderColor, borderWidth: StyleSheet.hairlineWidth }
            : null,
        ]}
      >
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
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
