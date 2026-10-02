import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';

type DateSeparatorProps = {
  label: string;
};

function DateSeparatorView({ label }: DateSeparatorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text
        accessibilityRole="header"
        style={[
          styles.pill,
          { backgroundColor: colors.chip, color: colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export const DateSeparator = memo(DateSeparatorView);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  pill: {
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
