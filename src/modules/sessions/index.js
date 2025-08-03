/**
 * Sessions Module Index
 * Exports all sessions-related functionality
 */

// Domain
const Session = require("./domain/entities/Session");

// Infrastructure
const SessionRepository = require("./infrastructure/repositories/SessionRepository");

// Presentation
const sessionRoutes = require("./presentation/routes/sessions");

module.exports = {
  // Domain Entities
  Session,

  // Infrastructure
  SessionRepository,

  // Presentation
  sessionRoutes,
};
