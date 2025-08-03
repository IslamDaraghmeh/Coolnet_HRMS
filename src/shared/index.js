/**
 * Shared Module Index
 * Exports all shared utilities, configurations, and middlewares
 */

// Configuration
const config = require("./config");
const dbConnection = require("./config/connection");

// Utilities
const { asyncHandler } = require("./utils/asyncHandler");
const {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
} = require("./utils/logger");
const {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} = require("./utils/errors");

// Middlewares
const {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  selfOrAdmin,
  managerOrSelf,
} = require("./middlewares/auth");

const { validateRequest, validate } = require("./middlewares/validation");

const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const { auditMiddleware } = require("./middlewares/audit");

const { sessionMiddleware } = require("./middlewares/session");

module.exports = {
  // Configuration
  config,
  dbConnection,

  // Utilities
  asyncHandler,
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,

  // Error Classes
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,

  // Middlewares
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  selfOrAdmin,
  managerOrSelf,
  validateRequest,
  validate,
  errorHandler,
  notFoundHandler,
  auditMiddleware,
  sessionMiddleware,
};
