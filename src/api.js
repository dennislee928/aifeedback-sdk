import { createError, createErrorFromResponse } from './errors';

async function requestToken(dsn, serviceId) {
  const response = await fetch(`${dsn}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ serviceId: serviceId }),
  });

  if (!response.ok) {
    throw await createErrorFromResponse(response);
  }

  const data = await response.json();
  return data.token;
}

async function submitFeedbackData(dsn, token, feedbackData) {
  const response = await fetch(`${dsn}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(feedbackData),
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
    const token = await requestToken(dsn, serviceId);

    // Stage 2: Submit feedback
    const result = await submitFeedbackData(dsn, token, feedbackData);

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
