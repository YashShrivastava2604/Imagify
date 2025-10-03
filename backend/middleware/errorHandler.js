const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof Error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }

  if (typeof error === 'string') {
    return res.status(500).json({
      error: error
    });
  }

  return res.status(500).json({
    error: 'Unknown error occurred'
  });
};

module.exports = errorHandler;
