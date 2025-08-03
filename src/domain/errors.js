/**
 * Custom Error Classes for Domain Layer
 */

class DomainError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends DomainError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends DomainError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends DomainError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class BusinessRuleError extends DomainError {
  constructor(message) {
    super(message, 422);
    this.name = 'BusinessRuleError';
  }
}

module.exports = {
  DomainError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
}; 