'use strict';

import { validateFeedbackData } from './validation';
import { performSubmission } from './api';

let serviceId = null;
let dsn = null;

const FeedbackSDK = {
  /**
   * Initializes the Feedback SDK.
   * @param {object} config - The configuration object.
   * @param {string} config.serviceId - The service ID provided by the organization.
   * @param {string} config.dsn - The base URL for the API endpoints.
   */
  init: function (config) {
    if (!config || !config.serviceId) {
      throw new Error(
        'FeedbackSDK.init(config) requires a config object with a serviceId property.'
      );
    }
    if (!config.dsn) {
      throw new Error('FeedbackSDK.init(config) requires a config object with a dsn property.');
    }
    serviceId = config.serviceId;
    dsn = config.dsn.endsWith('/') ? config.dsn.slice(0, -1) : config.dsn;
  },

  /**
   * Submits feedback data to the backend.
   * @param {object} feedbackData - The feedback data object.
   * @param {string} feedbackData.feedbackRating - "good", "normal", or "bad".
   * @param {string} [feedbackData.feedbackComment] - User comment, max 500 chars.
   * @param {number} [feedbackData.durationSec] - Duration in seconds, non-negative.
   * @returns {Promise<any>} A promise that resolves with the server response on success, or rejects with a structured error.
   */
  submit: async function (feedbackData) {
    if (!serviceId || !dsn) {
      throw new Error(
        'FeedbackSDK.submit() called before init(). Please call FeedbackSDK.init() first.'
      );
    }

    const validationError = validateFeedbackData(feedbackData);
    if (validationError) {
      return Promise.reject(validationError);
    }

    return performSubmission(dsn, serviceId, feedbackData);
  },
};

export default FeedbackSDK;
