import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOTION } from '../../../theme/motion';
import { radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  selected?: boolean;
};

const OPTION_HEIGHT = 52;

type ActionSheetProps = {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: ActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(MOTION.fast)}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close actions"
        />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(MOTION.base)}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.sm,
          },
        ]}
      >
        {title ? (
          <Text style={[styles.title, { color: colors.textMuted }]}>
            {title}
          </Text>
        ) : null}
        <View style={[styles.group, { borderColor: colors.border }]}>
          {options.map((option, index) => (
            <Pressable
              key={option.label}
              onPress={option.onPress}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: option.selected }}
              style={({ pressed }) => [
                styles.option,
                index < options.length - 1 && styles.divider,
                {
                  borderColor: colors.border,
                  backgroundColor: pressed ? colors.chip : colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: option.destructive ? colors.danger : colors.text },
                ]}
              >
                {option.label}
              </Text>
              {option.selected ? (
                <Text style={[styles.check, { color: colors.primary }]}>✓</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={({ pressed }) => [
            styles.option,
            styles.cancel,
            { backgroundColor: pressed ? colors.chip : colors.background },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              styles.cancelText,
              { color: colors.text },
            ]}
          >
            Cancel
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  group: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  option: {
    minHeight: OPTION_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 17,
  },
  check: {
    fontSize: 17,
    fontWeight: '700',
  },
  cancel: {
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
  },
});
