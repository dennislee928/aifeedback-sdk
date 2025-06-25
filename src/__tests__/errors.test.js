import { createError, createErrorFromResponse } from '../errors';

describe('createError', () => {
  test('should create error with code and message', () => {
    const error = createError('TEST_ERROR', 'Test error message');

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
  });

  test('should create error with different codes', () => {
    const codes = ['INVALID_DATA', 'SERVER_ERROR', 'UNAUTHORIZED'];

    codes.forEach((code) => {
      const error = createError(code, 'Test message');
      expect(error.code).toBe(code);
    });
  });
});

describe('createErrorFromResponse', () => {
  const createMockResponse = (status, jsonData = null, shouldThrowOnJson = false) => ({
    status,
    json: jest.fn().mockImplementation(() => {
      if (shouldThrowOnJson) {
        throw new Error('Invalid JSON');
      }
      return Promise.resolve(jsonData || {});
    }),
  });

  test('should create error with message from response body', async () => {
    const mockResponse = createMockResponse(400, {
      message: 'Custom error message',
    });

    const error = await createErrorFromResponse(mockResponse);

    expect(error.code).toBe('INVALID_DATA');
    expect(error.message).toBe('Custom error message');
    expect(mockResponse.json).toHaveBeenCalled();
  });

  test('should create error with default message when response body has no message', async () => {
    const mockResponse = createMockResponse(500, {});

    const error = await createErrorFromResponse(mockResponse);

    expect(error.code).toBe('SERVER_ERROR');
    expect(error.message).toBe('Request failed with status 500');
  });

  test('should handle JSON parsing error gracefully', async () => {
    const mockResponse = createMockResponse(400, null, true);

    const error = await createErrorFromResponse(mockResponse);

    expect(error.code).toBe('INVALID_DATA');
    expect(error.message).toBe('Request failed with status 400');
  });

  describe('HTTP status code mapping', () => {
    test('should map 400 to INVALID_DATA', async () => {
      const mockResponse = createMockResponse(400);
      const error = await createErrorFromResponse(mockResponse);
      expect(error.code).toBe('INVALID_DATA');
    });

    test('should map 401 to UNAUTHORIZED', async () => {
      const mockResponse = createMockResponse(401);
      const error = await createErrorFromResponse(mockResponse);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    test('should map 409 to SUBMISSION_CONFLICT', async () => {
      const mockResponse = createMockResponse(409);
      const error = await createErrorFromResponse(mockResponse);
      expect(error.code).toBe('SUBMISSION_CONFLICT');
    });

    test('should map other status codes to SERVER_ERROR', async () => {
      const statusCodes = [403, 404, 500, 502, 503];

      for (const status of statusCodes) {
        const mockResponse = createMockResponse(status);
        const error = await createErrorFromResponse(mockResponse);
        expect(error.code).toBe('SERVER_ERROR');
        expect(error.message).toBe(`Request failed with status ${status}`);
      }
    });
  });

  test('should prioritize response body message over default message', async () => {
    const mockResponse = createMockResponse(500, {
      message: 'Database connection failed',
    });

    const error = await createErrorFromResponse(mockResponse);

    expect(error.code).toBe('SERVER_ERROR');
    expect(error.message).toBe('Database connection failed');
  });

  test('should handle empty response body', async () => {
    const mockResponse = createMockResponse(404, null);

    const error = await createErrorFromResponse(mockResponse);

    expect(error.code).toBe('SERVER_ERROR');
    expect(error.message).toBe('Request failed with status 404');
  });
});
