/**
 * Custom Error Classes for HR Backend API
 */

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Duplicate Error
 */
class DuplicateError extends AppError {
  constructor(field = "Field") {
    super(`${field} already exists`, 409);
    this.name = "DuplicateError";
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

/**
 * Database Error
 */
class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500);
    this.name = "DatabaseError";
  }
}

/**
 * File Upload Error
 */
class FileUploadError extends AppError {
  constructor(message = "File upload failed") {
    super(message, 400);
    this.name = "FileUploadError";
  }
}

/**
 * External Service Error
 */
class ExternalServiceError extends AppError {
  constructor(service, message = "External service error") {
    super(`${service}: ${message}`, 502);
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

/**
 * Business Logic Error
 */
class BusinessLogicError extends AppError {
  constructor(message = "Business rule violation") {
    super(message, 400);
    this.name = "BusinessLogicError";
  }
}

/**
 * Workflow Error
 */
class WorkflowError extends AppError {
  constructor(message = "Workflow state error") {
    super(message, 400);
    this.name = "WorkflowError";
  }
}

/**
 * Error Handler Utility Functions
 */

/**
 * Handle Sequelize validation errors
 * @param {Error} error - Sequelize error
 * @returns {ValidationError} Formatted validation error
 */
function handleSequelizeValidationError(error) {
  const errors = [];

  if (error.errors) {
    error.errors.forEach((err) => {
      errors.push({
        field: err.path,
        message: err.message,
        value: err.value,
      });
    });
  }

  return new ValidationError("Validation failed", errors);
}

/**
 * Handle Sequelize unique constraint errors
 * @param {Error} error - Sequelize error
 * @returns {DuplicateError} Formatted duplicate error
 */
function handleSequelizeUniqueConstraintError(error) {
  const field = error.errors?.[0]?.path || "Field";
  return new DuplicateError(field);
}

/**
 * Handle Sequelize foreign key constraint errors
 * @param {Error} error - Sequelize error
 * @returns {ValidationError} Formatted validation error
 */
function handleSequelizeForeignKeyConstraintError(error) {
  return new ValidationError("Referenced record does not exist");
}

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {AuthenticationError} Formatted authentication error
 */
function handleJWTError(error) {
  if (error.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired");
  }
  if (error.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token");
  }
  return new AuthenticationError("Token verification failed");
}

/**
 * Handle multer file upload errors
 * @param {Error} error - Multer error
 * @returns {FileUploadError} Formatted file upload error
 */
function handleMulterError(error) {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new FileUploadError("File size too large");
  }
  if (error.code === "LIMIT_FILE_COUNT") {
    return new FileUploadError("Too many files");
  }
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new FileUploadError("Unexpected file field");
  }
  return new FileUploadError(error.message);
}

/**
 * Create error response object
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
function createErrorResponse(error) {
  const response = {
    success: false,
    error: {
      message: error.message,
      status: error.status || "error",
      statusCode: error.statusCode || 500,
    },
  };

  // Add validation errors if available
  if (error.errors && Array.isArray(error.errors)) {
    response.error.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    },
    context,
  };

  console.error("Error Log:", JSON.stringify(errorLog, null, 2));
}

module.exports = {
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
};
