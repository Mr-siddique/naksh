import { useEffect, useState } from 'react';
import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useConversationStore } from '../store/useConversationStore';

type StreamingTextProps = {
  messageId: string;
  text: string;
  style: StyleProp<TextStyle>;
  color: string;
};

export const CURSOR_BLINK_MS = 530;

export function StreamingText({
  messageId,
  text,
  style,
  color,
}: StreamingTextProps) {
  const visibleLength = useConversationStore(s =>
    s.streaming?.messageId === messageId ? s.streaming.visibleLength : null,
  );
  const reduceMotion = useReducedMotion();
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      setCursorOn(true);
      return;
    }
    const timer = setInterval(() => setCursorOn(on => !on), CURSOR_BLINK_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <Text style={style}>
      {visibleLength === null ? text : text.slice(0, visibleLength)}
      <Text style={cursorOn ? { color } : styles.cursorOff}>▍</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  cursorOff: {
    color: 'transparent',
  },
});
