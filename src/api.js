import { createError, createErrorFromResponse } from './errors';

async function requestToken(dsn, serviceId) {
  const response = await fetch(`${dsn}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ serviceId: serviceId }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await createErrorFromResponse(response);
  }
}

async function submitFeedbackData(dsn, feedbackData) {
  const response = await fetch(`${dsn}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackData),
    credentials: 'include',
  });

  if (!response.ok) {
    throw await createErrorFromResponse(response);
  }

  try {
    return await response.json();
  } catch (e) {
    return {}; // Resolve with empty object if response has no body
  }
}

export async function performSubmission(dsn, serviceId, feedbackData) {
  try {
    // Stage 1: Request token
    await requestToken(dsn, serviceId);

    // Stage 2: Submit feedback
    const result = await submitFeedbackData(dsn, feedbackData);

    return result;
  } catch (error) {
    // Rethrow structured errors or create a new one for network issues
    if (error.code) {
      throw error;
    } else {
      throw createError('SERVER_ERROR', error.message || 'A network error occurred.');
    }
  }
}
