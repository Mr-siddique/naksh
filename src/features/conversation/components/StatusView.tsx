import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MIN_TOUCH, radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';

type StatusViewProps =
  | { variant: 'loading' }
  | { variant: 'empty' }
  | { variant: 'error'; onRetry: () => void };

const COPY = {
  loading: { icon: null, message: 'Loading conversation...' },
  empty: { icon: '🔮', message: 'Start your conversation.' },
  error: { icon: '⚠️', message: 'Unable to load conversation.' },
} as const;

export function StatusView(props: StatusViewProps) {
  const { colors } = useTheme();
  const { icon, message } = COPY[props.variant];

  return (
    <View style={styles.container}>
      {props.variant === 'loading' ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Text
          style={styles.icon}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {icon}
        </Text>
      )}
      <Text
        style={[styles.message, { color: colors.textMuted }]}
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
      {props.variant === 'error' && (
        <Pressable
          onPress={props.onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          style={({ pressed }) => [
            styles.retry,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.onPrimary }]}>
            Retry
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  retry: {
    minHeight: MIN_TOUCH,
    minWidth: 120,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
