import { validateFeedbackData } from '../validation';

describe('validateFeedbackData', () => {
  describe('valid data', () => {
    test('should return null for valid minimal data', () => {
      const result = validateFeedbackData({
        feedbackRating: 'good',
      });
      expect(result).toBeNull();
    });

    test('should return null for valid complete data', () => {
      const result = validateFeedbackData({
        feedbackRating: 'normal',
        feedbackComment: 'This is a test comment',
        inferenceSec: 30,
      });
      expect(result).toBeNull();
    });

    test('should accept all valid rating values', () => {
      const validRatings = ['good', 'normal', 'bad'];

      validRatings.forEach((rating) => {
        const result = validateFeedbackData({
          feedbackRating: rating,
        });
        expect(result).toBeNull();
      });
    });

    test('should accept empty comment', () => {
      const result = validateFeedbackData({
        feedbackRating: 'good',
        feedbackComment: '',
      });
      expect(result).toBeNull();
    });

    test('should accept maximum length comment (500 chars)', () => {
      const maxComment = 'a'.repeat(500);
      const result = validateFeedbackData({
        feedbackRating: 'good',
        feedbackComment: maxComment,
      });
      expect(result).toBeNull();
    });

    test('should accept zero duration', () => {
      const result = validateFeedbackData({
        feedbackRating: 'good',
        inferenceSec: 0,
      });
      expect(result).toBeNull();
    });
  });

  describe('invalid feedbackData object', () => {
    test('should return error for null feedbackData', () => {
      const result = validateFeedbackData(null);
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'feedbackData must be an object.',
      });
    });

    test('should return error for undefined feedbackData', () => {
      const result = validateFeedbackData(undefined);
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'feedbackData must be an object.',
      });
    });

    test('should return error for non-object feedbackData', () => {
      const invalidValues = ['string', 123, true, []];

      invalidValues.forEach((value) => {
        const result = validateFeedbackData(value);
        expect(result).toMatchObject({
          code: 'INVALID_DATA',
          message: 'feedbackData must be an object.',
        });
      });
    });
  });

  describe('invalid feedbackRating', () => {
    test('should return error for missing feedbackRating', () => {
      const result = validateFeedbackData({});
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'feedbackRating is required and must be one of: good, normal, bad.',
      });
    });

    test('should return error for null feedbackRating', () => {
      const result = validateFeedbackData({
        feedbackRating: null,
      });
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'feedbackRating is required and must be one of: good, normal, bad.',
      });
    });

    test('should return error for invalid feedbackRating values', () => {
      const invalidRatings = ['excellent', 'poor', 'ok', 'GOOD', 'Bad', 123, true];

      invalidRatings.forEach((rating) => {
        const result = validateFeedbackData({
          feedbackRating: rating,
        });
        expect(result).toMatchObject({
          code: 'INVALID_DATA',
          message: 'feedbackRating is required and must be one of: good, normal, bad.',
        });
      });
    });
  });

  describe('invalid feedbackComment', () => {
    test('should return error for non-string comment', () => {
      const invalidComments = [123, true, null, [], {}];

      invalidComments.forEach((comment) => {
        const result = validateFeedbackData({
          feedbackRating: 'good',
          feedbackComment: comment,
        });
        expect(result).toMatchObject({
          code: 'INVALID_DATA',
          message: 'feedbackComment must be a string with a maximum length of 500 characters.',
        });
      });
    });

    test('should return error for too long comment (over 500 chars)', () => {
      const longComment = 'a'.repeat(501);
      const result = validateFeedbackData({
        feedbackRating: 'good',
        feedbackComment: longComment,
      });
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'feedbackComment must be a string with a maximum length of 500 characters.',
      });
    });
  });

  describe('invalid inferenceSec', () => {
    test('should return error for non-number duration', () => {
      const invalidDurations = ['30', true, null, [], {}];

      invalidDurations.forEach((duration) => {
        const result = validateFeedbackData({
          feedbackRating: 'good',
          inferenceSec: duration,
        });
        expect(result).toMatchObject({
          code: 'INVALID_DATA',
          message: 'inferenceSec must be a non-negative number.',
        });
      });
    });

    test('should return error for negative duration', () => {
      const result = validateFeedbackData({
        feedbackRating: 'good',
        inferenceSec: -1,
      });
      expect(result).toMatchObject({
        code: 'INVALID_DATA',
        message: 'inferenceSec must be a non-negative number.',
      });
    });
  });
});
