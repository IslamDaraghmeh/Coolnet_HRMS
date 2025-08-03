/**
 * Audit Module Index
 * Exports all audit-related functionality
 */

// Domain
const AuditLog = require("./domain/entities/AuditLog");

// Infrastructure
const AuditLogRepository = require("./infrastructure/repositories/AuditLogRepository");

// Presentation
const auditRoutes = require("./presentation/routes/audit");

module.exports = {
  // Domain Entities
  AuditLog,

  // Infrastructure
  AuditLogRepository,

  // Presentation
  auditRoutes,
};
