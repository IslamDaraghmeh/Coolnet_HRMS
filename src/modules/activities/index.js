/**
 * Activities Module Index
 * Exports all activities-related functionality
 */

// Domain
const UserActivity = require("./domain/entities/UserActivity");

// Infrastructure
const UserActivityRepository = require("./infrastructure/repositories/UserActivityRepository");

// Presentation
const activityRoutes = require("./presentation/routes/activities");

module.exports = {
  // Domain Entities
  UserActivity,

  // Infrastructure
  UserActivityRepository,

  // Presentation
  activityRoutes,
};
