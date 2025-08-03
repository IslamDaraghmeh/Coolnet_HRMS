/**
 * Notifications Module Index
 * Exports all notifications-related functionality
 */

// Domain
const Notification = require("./domain/entities/Notification");
const INotificationRepository = require("./domain/interfaces/INotificationRepository");

// Infrastructure
const NotificationRepository = require("./infrastructure/repositories/NotificationRepository");

// Presentation
const notificationRoutes = require("./presentation/routes/notifications");
const notificationValidators = require("./presentation/validators/notifications");

module.exports = {
  // Domain Entities
  Notification,
  INotificationRepository,

  // Infrastructure
  NotificationRepository,

  // Presentation
  notificationRoutes,
  notificationValidators,
};
