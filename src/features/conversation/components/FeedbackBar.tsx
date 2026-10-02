import { useEffect, useRef } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FAST_TIMING, TIMING } from '../../../theme/motion';
import { MIN_TOUCH, radius, spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme/useTheme';
import { FEEDBACK_REASONS } from '../constants';
import type { Feedback } from '../conversation.types';
import { useConversationStore } from '../store/useConversationStore';

type FeedbackBarProps = {
  messageId: string;
  feedback?: Feedback;
};

const RATINGS = [
  { rating: 'like', icon: '👍', label: 'Like' },
  { rating: 'dislike', icon: '👎', label: 'Dislike' },
] as const;

const POP_SCALE = 1.2;

type RatingButtonProps = {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

function RatingButton({ icon, label, selected, onPress }: RatingButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const wasSelected = useRef(selected);

  useEffect(() => {
    if (selected && !wasSelected.current) {
      scale.value = withSequence(
        withTiming(POP_SCALE, FAST_TIMING),
        withSpring(1, FAST_TIMING),
      );
    }
    wasSelected.current = selected;
  }, [selected, scale]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={styles.rating}
    >
      <Animated.View
        style={[
          styles.ratingFill,
          selected && {
            backgroundColor: colors.chipSelected,
            borderColor: colors.primary,
          },
          popStyle,
        ]}
      >
        <Text style={[styles.icon, !selected && styles.unselectedIcon]}>
          {icon}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function FeedbackBar({ messageId, feedback }: FeedbackBarProps) {
  const { colors } = useTheme();
  const rate = useConversationStore(s => s.rate);
  const toggleReason = useConversationStore(s => s.toggleReason);
  const isDisliked = feedback?.rating === 'dislike';

  const chipsHeight = useSharedValue(0);
  const measuredHeight = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (measuredHeight.current !== null) {
      chipsHeight.value = withTiming(
        isDisliked ? measuredHeight.current : 0,
        TIMING,
      );
    }
  }, [isDisliked, chipsHeight]);

  const onChipsLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    const isFirstMeasure = measuredHeight.current === null;
    measuredHeight.current = height;
    if (isFirstMeasure || isDisliked) {
      chipsHeight.value = isDisliked ? height : 0;
    }
  };

  const chipsStyle = useAnimatedStyle(() => ({ height: chipsHeight.value }));

  return (
    <View style={styles.container}>
      <View style={styles.ratings}>
        {RATINGS.map(({ rating, icon, label }) => (
          <RatingButton
            key={rating}
            icon={icon}
            label={label}
            selected={feedback?.rating === rating}
            onPress={() => rate(messageId, rating)}
          />
        ))}
      </View>
      <Animated.View
        testID="feedback-chips"
        style={[styles.chipsClip, chipsStyle]}
        pointerEvents={isDisliked ? 'auto' : 'none'}
        accessibilityElementsHidden={!isDisliked}
        importantForAccessibility={isDisliked ? 'auto' : 'no-hide-descendants'}
      >
        <View style={styles.chips} onLayout={onChipsLayout}>
          {FEEDBACK_REASONS.map(({ id, label }) => {
            const selected = isDisliked && feedback.reasons.includes(id);
            return (
              <Pressable
                key={id}
                onPress={() => toggleReason(messageId, id)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected
                      ? colors.chipSelected
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? colors.primary : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const RATING_FILL = 34;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  ratings: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  rating: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingFill: {
    width: RATING_FILL,
    height: RATING_FILL,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  unselectedIcon: {
    opacity: 0.6,
  },
  chipsClip: {
    overflow: 'hidden',
  },
  chips: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  chip: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
