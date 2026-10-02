import type { ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  FADE_IN,
  FADE_IN_DOWN,
  FAST_TIMING,
  TIMING,
} from '../../../theme/motion';
import { MESSAGE_GUTTER, radius, spacing } from '../../../theme/spacing';
import { AI_SENDER } from '../constants';
import { isFresh } from '../utils/isFresh';
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
  createdAt: string;
  quote?: string;
  renderText?: (style: StyleProp<TextStyle>) => ReactNode;
  onLongPress?: () => void;
  children?: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.97;
const EXIT_SCALE = 0.95;

const exitDelete = () => {
  'worklet';
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, TIMING),
      transform: [{ scale: withTiming(EXIT_SCALE, TIMING) }],
    },
  };
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
  createdAt,
  quote,
  renderText,
  onLongPress,
  children,
}: BubbleProps) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const fresh = isFresh(createdAt);
  const entering = align === 'right' ? FADE_IN_DOWN : FADE_IN;
  const textStyle = [styles.text, { color: textColor }];
  const bubbleProps = {
    testID: 'message-bubble',
    accessible: true,
    accessibilityLabel: quote
      ? `${sender}, replying to ${AI_SENDER}, "${truncate(quote, 80)}": ${text}`
      : `${sender}: ${text}`,
    style: [
      styles.bubble,
      pressStyle,
      { backgroundColor },
      borderColor
        ? { borderColor, borderWidth: StyleSheet.hairlineWidth }
        : null,
    ],
  };
  const content = (
    <>
      {quote ? <ReplyQuote text={quote} color={textColor} /> : null}
      {renderText ? (
        renderText(textStyle)
      ) : (
        <Text style={textStyle}>{text}</Text>
      )}
    </>
  );

  return (
    <Animated.View
      testID="message-row"
      entering={fresh ? entering : undefined}
      exiting={exitDelete}
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
      <AnimatedPressable
        {...bubbleProps}
        onPressIn={
          onLongPress
            ? () => {
                scale.value = withTiming(PRESSED_SCALE, FAST_TIMING);
              }
            : undefined
        }
        onPressOut={
          onLongPress
            ? () => {
                scale.value = withSpring(1, TIMING);
              }
            : undefined
        }
        onLongPress={onLongPress}
        accessibilityActions={onLongPress ? LONG_PRESS_ACTIONS : undefined}
        accessibilityHint={onLongPress ? 'Long-press for actions' : undefined}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'longpress') {
            onLongPress?.();
          }
        }}
      >
        {content}
      </AnimatedPressable>
      {children}
    </Animated.View>
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
