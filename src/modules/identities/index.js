/**
 * Identities Module Index
 * Exports all identities-related functionality
 */

// Domain
const UserIdentity = require("./domain/entities/UserIdentity");

// Infrastructure
const UserIdentityRepository = require("./infrastructure/repositories/UserIdentityRepository");

// Presentation
const identityRoutes = require("./presentation/routes/identities");

module.exports = {
  // Domain Entities
  UserIdentity,

  // Infrastructure
  UserIdentityRepository,

  // Presentation
  identityRoutes,
};
