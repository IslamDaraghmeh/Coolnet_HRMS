/**
 * Shared Error Classes
 * Used across all modules for consistent error handling
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500);
    this.name = "DatabaseError";
  }
}

module.exports = {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
};
