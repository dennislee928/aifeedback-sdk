import { performSubmission } from '../api';
import { createError, createErrorFromResponse } from '../errors';

// Mock the errors module
jest.mock('../errors');

// Mock fetch globally
global.fetch = jest.fn();

const mockCreateError = createError;
const mockCreateErrorFromResponse = createErrorFromResponse;

describe('performSubmission', () => {
  const dsn = 'https://api.example.com';
  const serviceId = 'test-service-id';
  const feedbackData = {
    feedbackRating: 'good',
    feedbackComment: 'Great service!',
    inferenceSec: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('successful submission', () => {
    test('should complete both stages successfully and return result', async () => {
      // Mock successful token request
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'test-token' }),
        })
        // Mock successful feedback submission
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: '123', status: 'submitted' }),
        });

      const result = await performSubmission(dsn, serviceId, feedbackData);

      expect(result).toEqual({ id: '123', status: 'submitted' });
      expect(fetch).toHaveBeenCalledTimes(2);

      // Verify token request
      expect(fetch).toHaveBeenNthCalledWith(1, `${dsn}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });

      // Verify feedback submission
      expect(fetch).toHaveBeenNthCalledWith(2, `${dsn}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: JSON.stringify(feedbackData),
      });
    });

    test('should handle empty response body gracefully', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockRejectedValue(new Error('No JSON')),
        });

      const result = await performSubmission(dsn, serviceId, feedbackData);

      expect(result).toEqual({});
    });
  });

  describe('token request failures', () => {
    test('should throw error when token request fails', async () => {
      const tokenError = new Error('Token request failed');
      tokenError.code = 'UNAUTHORIZED';

      mockCreateErrorFromResponse.mockResolvedValue(tokenError);

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(performSubmission(dsn, serviceId, feedbackData)).rejects.toBe(tokenError);

      expect(mockCreateErrorFromResponse).toHaveBeenCalledWith({
        ok: false,
        status: 401,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('feedback submission failures', () => {
    test('should throw error when feedback submission fails', async () => {
      const feedbackError = new Error('Feedback submission failed');
      feedbackError.code = 'INVALID_DATA';

      mockCreateErrorFromResponse.mockResolvedValue(feedbackError);

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
        });

      await expect(performSubmission(dsn, serviceId, feedbackData)).rejects.toBe(feedbackError);

      expect(mockCreateErrorFromResponse).toHaveBeenCalledWith({
        ok: false,
        status: 400,
      });
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('network errors', () => {
    test('should create SERVER_ERROR for network error during token request', async () => {
      const networkError = new Error('Network error');
      const serverError = new Error('A network error occurred.');
      serverError.code = 'SERVER_ERROR';

      mockCreateError.mockReturnValue(serverError);
      fetch.mockRejectedValueOnce(networkError);

      await expect(performSubmission(dsn, serviceId, feedbackData)).rejects.toBe(serverError);

      expect(mockCreateError).toHaveBeenCalledWith('SERVER_ERROR', 'Network error');
    });

    test('should create SERVER_ERROR with default message for unknown error', async () => {
      const unknownError = {};
      const serverError = new Error('A network error occurred.');
      serverError.code = 'SERVER_ERROR';

      mockCreateError.mockReturnValue(serverError);
      fetch.mockRejectedValueOnce(unknownError);

      await expect(performSubmission(dsn, serviceId, feedbackData)).rejects.toBe(serverError);

      expect(mockCreateError).toHaveBeenCalledWith('SERVER_ERROR', 'A network error occurred.');
    });

    test('should rethrow structured errors without modification', async () => {
      const structuredError = new Error('Custom error');
      structuredError.code = 'CUSTOM_ERROR';

      fetch.mockRejectedValueOnce(structuredError);

      await expect(performSubmission(dsn, serviceId, feedbackData)).rejects.toBe(structuredError);

      expect(mockCreateError).not.toHaveBeenCalled();
    });
  });

  describe('request parameters', () => {
    test('should make correct token request', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

      await performSubmission(dsn, serviceId, feedbackData);

      expect(fetch).toHaveBeenNthCalledWith(1, `${dsn}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
    });

    test('should make correct feedback request', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

      await performSubmission(dsn, serviceId, feedbackData);

      expect(fetch).toHaveBeenNthCalledWith(2, `${dsn}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: JSON.stringify(feedbackData),
      });
    });
  });
});
