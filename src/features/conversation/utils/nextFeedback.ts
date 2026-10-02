import type { Feedback, FeedbackReason } from '../conversation.types';

export function applyRating(
  current: Feedback | undefined,
  rating: Feedback['rating'],
): Feedback | undefined {
  if (current?.rating === rating) {
    return undefined;
  }
  return { rating, reasons: [] };
}

export function toggleFeedbackReason(
  current: Feedback | undefined,
  reason: FeedbackReason,
): Feedback | undefined {
  if (current?.rating !== 'dislike') {
    return current;
  }
  const reasons = current.reasons.includes(reason)
    ? current.reasons.filter(r => r !== reason)
    : [...current.reasons, reason];
  return { rating: 'dislike', reasons };
}
