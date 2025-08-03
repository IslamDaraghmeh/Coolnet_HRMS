const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DuplicateError,
  RateLimitError,
  DatabaseError,
  FileUploadError,
  ExternalServiceError,
  BusinessLogicError,
  WorkflowError,
  handleSequelizeValidationError,
  handleSequelizeUniqueConstraintError,
  handleSequelizeForeignKeyConstraintError,
  handleJWTError,
  handleMulterError,
  createErrorResponse,
  logError,
} = require("../../utils/errors");

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });

  // Handle Sequelize errors
  if (err.name === "SequelizeValidationError") {
    error = handleSequelizeValidationError(err);
  } else if (err.name === "SequelizeUniqueConstraintError") {
    error = handleSequelizeUniqueConstraintError(err);
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    error = handleSequelizeForeignKeyConstraintError(err);
  } else if (err.name === "SequelizeDatabaseError") {
    error = new DatabaseError(err.message);
  } else if (err.name === "SequelizeConnectionError") {
    error = new DatabaseError("Database connection failed");
  } else if (err.name === "SequelizeTimeoutError") {
    error = new DatabaseError("Database operation timeout");
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = handleJWTError(err);
  }

  // Handle Multer errors
  if (err.code && err.code.startsWith("LIMIT_")) {
    error = handleMulterError(err);
  }

  // Handle specific error types
  if (err instanceof ValidationError) {
    error = err;
  } else if (err instanceof AuthenticationError) {
    error = err;
  } else if (err instanceof AuthorizationError) {
    error = err;
  } else if (err instanceof NotFoundError) {
    error = err;
  } else if (err instanceof ConflictError) {
    error = err;
  } else if (err instanceof DuplicateError) {
    error = err;
  } else if (err instanceof RateLimitError) {
    error = err;
  } else if (err instanceof DatabaseError) {
    error = err;
  } else if (err instanceof FileUploadError) {
    error = err;
  } else if (err instanceof ExternalServiceError) {
    error = err;
  } else if (err instanceof BusinessLogicError) {
    error = err;
  } else if (err instanceof WorkflowError) {
    error = err;
  } else if (err instanceof AppError) {
    error = err;
  }

  // Handle unknown errors
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = "Internal server error";
  }

  // Create error response
  const errorResponse = createErrorResponse(error);

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

module.exports = errorHandler;
