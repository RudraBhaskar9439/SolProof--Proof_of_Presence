const errorHandler = (err, req, res, next ) => {
    console.error('Unhandled error: ', err);

    if(res.headerssSent) {
        return next(err);
    }
 // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map(d => d.message),
    });
  }

  // Generic 500 error for unhandled exceptions
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.',
  });
};

module.exports = errorHandler;

