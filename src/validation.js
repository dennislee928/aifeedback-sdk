import { createError } from './errors';

const ALLOWED_RATINGS = ['good', 'normal', 'bad'];
const MAX_COMMENT_LENGTH = 500;

export function validateFeedbackData(feedbackData) {
  if (!feedbackData || typeof feedbackData !== 'object' || Array.isArray(feedbackData)) {
    return createError('INVALID_DATA', 'feedbackData must be an object.');
  }

  const { feedbackRating, feedbackComment, durationSec } = feedbackData;

  if (!feedbackRating || !ALLOWED_RATINGS.includes(feedbackRating)) {
    return createError(
      'INVALID_DATA',
      `feedbackRating is required and must be one of: ${ALLOWED_RATINGS.join(', ')}.`
    );
  }

  if (
    feedbackComment !== undefined &&
    (typeof feedbackComment !== 'string' || feedbackComment.length > MAX_COMMENT_LENGTH)
  ) {
    return createError(
      'INVALID_DATA',
      `feedbackComment must be a string with a maximum length of ${MAX_COMMENT_LENGTH} characters.`
    );
  }

  if (durationSec !== undefined && (typeof durationSec !== 'number' || durationSec < 0)) {
    return createError('INVALID_DATA', 'durationSec must be a non-negative number.');
  }

  return null;
}
