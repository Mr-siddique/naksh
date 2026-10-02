import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import type { RecommendationCardProps } from './recommendationRegistry';

export function RecommendationCard({
  recommendation,
  config,
  onPress,
}: RecommendationCardProps) {
  const { dark, colors } = useTheme();
  const { title, subtitle } = recommendation;
  const a11yLabel = subtitle
    ? `${config.label}: ${title}, ${subtitle}`
    : `${config.label}: ${title}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderTopColor: config.accent,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: `${config.accent}${dark ? '33' : '22'}` },
          ]}
        >
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <Text
          style={[styles.label, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[styles.subtitle, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
  },
});
