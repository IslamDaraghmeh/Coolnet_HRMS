const Joi = require("joi");

const createNotification = Joi.object({
  type: Joi.string().required().min(2).max(50),
  title: Joi.string().required().min(2).max(200),
  message: Joi.string().required().min(2).max(1000),
  recipientId: Joi.string().uuid().required(),
  data: Joi.object().optional(),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),
  deliveryMethod: Joi.string()
    .valid("in_app", "email", "sms", "push")
    .default("in_app"),
  expiresAt: Joi.date().iso().optional(),
});

const createBulkNotification = Joi.object({
  recipients: Joi.array().items(Joi.string().uuid()).required().min(1),
  notificationData: Joi.object({
    type: Joi.string().required().min(2).max(50),
    title: Joi.string().required().min(2).max(200),
    message: Joi.string().required().min(2).max(1000),
    data: Joi.object().optional(),
    priority: Joi.string()
      .valid("low", "medium", "high", "urgent")
      .default("medium"),
    deliveryMethod: Joi.string()
      .valid("in_app", "email", "sms", "push")
      .default("in_app"),
    expiresAt: Joi.date().iso().optional(),
  }).required(),
});

const updateNotificationSettings = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  notificationTypes: Joi.object({
    leaves: Joi.boolean().optional(),
    attendance: Joi.boolean().optional(),
    payroll: Joi.boolean().optional(),
    performance: Joi.boolean().optional(),
    loans: Joi.boolean().optional(),
    general: Joi.boolean().optional(),
  }).optional(),
  quietHours: Joi.object({
    enabled: Joi.boolean().optional(),
    startTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    endTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
  }).optional(),
});

const notificationId = Joi.object({
  id: Joi.string().uuid().required(),
});

const notificationFilters = Joi.object({
  type: Joi.string().optional(),
  isRead: Joi.boolean().optional(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  deliveryMethod: Joi.string()
    .valid("in_app", "email", "sms", "push")
    .optional(),
});

const notificationOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("createdAt", "priority", "isRead")
    .default("createdAt"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
});

module.exports = {
  createNotification,
  createBulkNotification,
  updateNotificationSettings,
  notificationId,
  notificationFilters,
  notificationOptions,
};
