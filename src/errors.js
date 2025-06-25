export function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function createErrorFromResponse(response) {
  let responseBody;
  try {
    responseBody = await response.json();
  } catch (e) {
    responseBody = {};
  }

  const message = responseBody.message || `Request failed with status ${response.status}`;
  let code = 'SERVER_ERROR';

  switch (response.status) {
    case 400:
      code = 'INVALID_DATA';
      break;
    case 401:
      code = 'UNAUTHORIZED';
      break;
    case 409:
      code = 'SUBMISSION_CONFLICT';
      break;
  }

  return createError(code, message);
}
