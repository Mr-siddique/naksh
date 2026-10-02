import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../../../theme/spacing';
import { AI_SENDER } from '../constants';

type ReplyQuoteProps = {
  text: string;
  color: string;
};

export function ReplyQuote({ text, color }: ReplyQuoteProps) {
  return (
    <View style={styles.quote}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color }]}>{AI_SENDER}</Text>
        <Text style={[styles.text, { color }]} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quote: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bar: {
    width: 2,
    opacity: 0.6,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  body: {
    flexShrink: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    fontSize: 13,
  },
});
