const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    error: {
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
