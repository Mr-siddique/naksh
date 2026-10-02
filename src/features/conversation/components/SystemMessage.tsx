import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import type { SystemMessage as SystemMessageType } from '../conversation.types';

type SystemMessageProps = {
  message: SystemMessageType;
};

export function SystemMessage({ message }: SystemMessageProps) {
  const { colors } = useTheme();

  return (
    <View testID="message-row" style={styles.row}>
      <Text style={[styles.text, { color: colors.textMuted }]}>
        {message.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
  },
});
