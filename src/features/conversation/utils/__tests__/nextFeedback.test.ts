import type { Feedback } from '../../conversation.types';
import { applyRating, toggleFeedbackReason } from '../nextFeedback';

const liked: Feedback = { rating: 'like', reasons: [] };
const disliked = (reasons: Feedback['reasons'] = []): Feedback => ({
  rating: 'dislike',
  reasons,
});

describe('applyRating', () => {
  it('R5.2: 👍 marks an unrated message as liked', () => {
    expect(applyRating(undefined, 'like')).toEqual(liked);
  });

  it('R5.2: 👍 again clears the rating', () => {
    expect(applyRating(liked, 'like')).toBeUndefined();
  });

  it('R5.3: 👎 marks the message as disliked with no reasons yet', () => {
    expect(applyRating(undefined, 'dislike')).toEqual(disliked());
    expect(applyRating(liked, 'dislike')).toEqual(disliked());
  });

  it('R5.5: 👍 while disliked switches to liked and clears the reasons', () => {
    expect(applyRating(disliked(['inaccurate', 'too_long']), 'like')).toEqual(
      liked,
    );
  });

  it('R5.6: 👎 while disliked clears the rating and the reasons', () => {
    expect(applyRating(disliked(['too_generic']), 'dislike')).toBeUndefined();
  });
});

describe('toggleFeedbackReason', () => {
  it('R5.4: selecting chips adds them, so several can be selected', () => {
    const one = toggleFeedbackReason(disliked(), 'too_long');
    const two = toggleFeedbackReason(one, 'inaccurate');
    expect(two).toEqual(disliked(['too_long', 'inaccurate']));
  });

  it('R5.4: tapping a selected chip deselects it', () => {
    expect(
      toggleFeedbackReason(disliked(['inaccurate', 'too_long']), 'inaccurate'),
    ).toEqual(disliked(['too_long']));
  });

  it('R5.4: ignores chips unless the message is disliked', () => {
    expect(toggleFeedbackReason(undefined, 'too_long')).toBeUndefined();
    expect(toggleFeedbackReason(liked, 'too_long')).toBe(liked);
  });
});
