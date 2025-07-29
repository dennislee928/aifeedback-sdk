import FeedbackSDK from '../index';
import { validateFeedbackData } from '../validation';
import { performSubmission } from '../api';

// Mock the dependencies
jest.mock('../validation');
jest.mock('../api');

const mockValidateFeedbackData = validateFeedbackData;
const mockPerformSubmission = performSubmission;

describe('FeedbackSDK', () => {
  const validConfig = {
    serviceId: 'test-service-id',
    dsn: 'https://api.example.com',
  };

  const validFeedbackData = {
    feedbackRating: 'good',
    feedbackComment: 'Great service!',
    inferenceSec: 15,
  };

  beforeEach(() => {
    // Reset the SDK state before each test
    jest.clearAllMocks();
  });

  describe('init', () => {
    test('should initialize successfully with valid config', () => {
      expect(() => {
        FeedbackSDK.init(validConfig);
      }).not.toThrow();
    });

    test('should throw error if config is missing', () => {
      expect(() => {
        FeedbackSDK.init();
      }).toThrow('FeedbackSDK.init(config) requires a config object with a serviceId property.');
    });

    test('should throw error if serviceId is missing', () => {
      expect(() => {
        FeedbackSDK.init({ dsn: 'https://api.example.com' });
      }).toThrow('FeedbackSDK.init(config) requires a config object with a serviceId property.');
    });

    test('should throw error if dsn is missing', () => {
      expect(() => {
        FeedbackSDK.init({ serviceId: 'test-service' });
      }).toThrow('FeedbackSDK.init(config) requires a config object with a dsn property.');
    });

    test('should remove trailing slash from dsn', async () => {
      mockValidateFeedbackData.mockReturnValue(null);
      mockPerformSubmission.mockResolvedValue({ success: true });

      FeedbackSDK.init({
        serviceId: 'test-service',
        dsn: 'https://api.example.com/',
      });

      await FeedbackSDK.submit(validFeedbackData);

      expect(mockPerformSubmission).toHaveBeenCalledWith(
        'https://api.example.com',
        'test-service',
        validFeedbackData
      );
    });
  });

  describe('submit', () => {
    test('should throw error if init has not been called', async () => {
      // Create a fresh import to ensure clean state
      jest.resetModules();
      const { default: FreshFeedbackSDK } = await import('../index');

      await expect(FreshFeedbackSDK.submit(validFeedbackData)).rejects.toThrow(
        'FeedbackSDK.submit() called before init(). Please call FeedbackSDK.init() first.'
      );
    });

    test('should reject if validation fails', async () => {
      const validationError = new Error('Invalid data');
      validationError.code = 'INVALID_DATA';

      mockValidateFeedbackData.mockReturnValue(validationError);

      FeedbackSDK.init(validConfig);

      await expect(FeedbackSDK.submit(validFeedbackData)).rejects.toBe(validationError);
    });

    test('should call performSubmission with correct arguments on successful validation', async () => {
      mockValidateFeedbackData.mockReturnValue(null);
      mockPerformSubmission.mockResolvedValue({ success: true });

      FeedbackSDK.init(validConfig);
      await FeedbackSDK.submit(validFeedbackData);

      expect(mockValidateFeedbackData).toHaveBeenCalledWith(validFeedbackData);
      expect(mockPerformSubmission).toHaveBeenCalledWith(
        validConfig.dsn,
        validConfig.serviceId,
        validFeedbackData
      );
    });

    test('should resolve with the result from performSubmission', async () => {
      const apiResult = { id: '123', status: 'submitted' };

      mockValidateFeedbackData.mockReturnValue(null);
      mockPerformSubmission.mockResolvedValue(apiResult);

      FeedbackSDK.init(validConfig);

      await expect(FeedbackSDK.submit(validFeedbackData)).resolves.toBe(apiResult);
    });

    test('should reject with the error from performSubmission', async () => {
      const apiError = new Error('Network error');
      apiError.code = 'SERVER_ERROR';

      mockValidateFeedbackData.mockReturnValue(null);
      mockPerformSubmission.mockRejectedValue(apiError);

      FeedbackSDK.init(validConfig);

      await expect(FeedbackSDK.submit(validFeedbackData)).rejects.toBe(apiError);
    });
  });
});
