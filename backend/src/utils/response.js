/**
 * Send a successful JSON response.
 */
function sendSuccess(res, { message = "Success", data = null, statusCode = 200 } = {}) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

/**
 * Send an error JSON response.
 */
function sendError(res, { message = "An error occurred", statusCode = 500 } = {}) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { sendSuccess, sendError };
