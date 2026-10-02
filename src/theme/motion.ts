import {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

export const MOTION = {
  fast: 150,
  base: 220,
  slow: 300,
} as const;

export const TIMING = {
  duration: MOTION.base,
  reduceMotion: ReduceMotion.System,
};

export const FAST_TIMING = {
  duration: MOTION.fast,
  reduceMotion: ReduceMotion.System,
};

export const FADE_IN = FadeIn.duration(MOTION.base).reduceMotion(
  ReduceMotion.System,
);
export const FADE_IN_FAST = FadeIn.duration(MOTION.fast).reduceMotion(
  ReduceMotion.System,
);
export const FADE_OUT_FAST = FadeOut.duration(MOTION.fast).reduceMotion(
  ReduceMotion.System,
);
export const FADE_IN_DOWN = FadeInDown.duration(MOTION.base).reduceMotion(
  ReduceMotion.System,
);
export const FADE_OUT_DOWN = FadeOutDown.duration(MOTION.fast).reduceMotion(
  ReduceMotion.System,
);
export const LAYOUT_TRANSITION = LinearTransition.duration(
  MOTION.base,
).reduceMotion(ReduceMotion.System);
