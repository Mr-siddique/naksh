import type { FeedbackReason } from './conversation.types';

export const AI_SENDER = 'AI Astrologer';
export const HUMAN_SENDER = 'Astrologer';

export const FEEDBACK_REASONS: { id: FeedbackReason; label: string }[] = [
  { id: 'inaccurate', label: 'Inaccurate' },
  { id: 'too_generic', label: 'Too Generic' },
  { id: 'didnt_help', label: "Didn't Help" },
  { id: 'too_long', label: 'Too Long' },
];
