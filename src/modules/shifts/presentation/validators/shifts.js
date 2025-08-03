const Joi = require("joi");

const createShift = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  breakDuration: Joi.number().integer().min(0).max(480).default(0),
  totalHours: Joi.number().precision(2).min(0).max(24).required(),
  isActive: Joi.boolean().default(true),
});

const updateShift = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(500),
  startTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  endTime: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  breakDuration: Joi.number().integer().min(0).max(480).optional(),
  totalHours: Joi.number().precision(2).min(0).max(24).optional(),
  isActive: Joi.boolean().optional(),
});

const shiftId = Joi.object({
  id: Joi.string().uuid().required(),
});

const createShiftAssignment = Joi.object({
  employeeId: Joi.string().uuid().required(),
  shiftId: Joi.string().uuid().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().optional().greater(Joi.ref("startDate")),
  isRecurring: Joi.boolean().default(false),
  recurringDays: Joi.array().items(Joi.number().min(1).max(7)).optional(),
  notes: Joi.string().optional().max(500),
});

const updateShiftAssignment = Joi.object({
  employeeId: Joi.string().uuid().optional(),
  shiftId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  isRecurring: Joi.boolean().optional(),
  recurringDays: Joi.array().items(Joi.number().min(1).max(7)).optional(),
  isActive: Joi.boolean().optional(),
  notes: Joi.string().optional().max(500),
});

const shiftFilters = Joi.object({
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

const shiftOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("name", "startTime", "createdAt").default("name"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("ASC"),
});

const shiftAssignmentFilters = Joi.object({
  employeeId: Joi.string().uuid().optional(),
  shiftId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  isActive: Joi.boolean().optional(),
  isRecurring: Joi.boolean().optional(),
});

const shiftAssignmentOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("startDate", "endDate", "createdAt")
    .default("startDate"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
});

module.exports = {
  createShift,
  updateShift,
  shiftId,
  createShiftAssignment,
  updateShiftAssignment,
  shiftFilters,
  shiftOptions,
  shiftAssignmentFilters,
  shiftAssignmentOptions,
};
