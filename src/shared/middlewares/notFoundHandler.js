const { NotFoundError } = require("../../utils/errors");

/**
 * 404 Not Found Handler Middleware
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = notFoundHandler;
