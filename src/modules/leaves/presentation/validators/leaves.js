const Joi = require("joi");

/**
 * Leave validation schemas
 */
const leaveSchemas = {
  // Create leave request validation
  createLeave: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
    leaveType: Joi.string()
      .valid(
        "annual",
        "sick",
        "personal",
        "maternity",
        "paternity",
        "bereavement",
        "unpaid"
      )
      .required()
      .messages({
        "any.only":
          "Leave type must be annual, sick, personal, maternity, paternity, bereavement, or unpaid",
        "any.required": "Leave type is required",
      }),
    startDate: Joi.date().min("now").required().messages({
      "date.min": "Start date must be in the future",
      "any.required": "Start date is required",
    }),
    endDate: Joi.date().min(Joi.ref("startDate")).required().messages({
      "date.min": "End date must be after start date",
      "any.required": "End date is required",
    }),
    reason: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Reason must be at least 10 characters long",
      "string.max": "Reason cannot exceed 1000 characters",
      "any.required": "Reason is required",
    }),
    attachments: Joi.array().items(Joi.string()).max(5).optional().messages({
      "array.max": "Maximum 5 attachments allowed",
    }),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).required(),
      phoneNumber: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .required(),
      relationship: Joi.string().max(50).required(),
    }).optional(),
  }),

  // Update leave request validation
  updateLeave: Joi.object({
    leaveType: Joi.string()
      .valid(
        "annual",
        "sick",
        "personal",
        "maternity",
        "paternity",
        "bereavement",
        "unpaid"
      )
      .optional()
      .messages({
        "any.only":
          "Leave type must be annual, sick, personal, maternity, paternity, bereavement, or unpaid",
      }),
    startDate: Joi.date().min("now").optional().messages({
      "date.min": "Start date must be in the future",
    }),
    endDate: Joi.date().min(Joi.ref("startDate")).optional().messages({
      "date.min": "End date must be after start date",
    }),
    reason: Joi.string().min(10).max(1000).optional().messages({
      "string.min": "Reason must be at least 10 characters long",
      "string.max": "Reason cannot exceed 1000 characters",
    }),
    attachments: Joi.array().items(Joi.string()).max(5).optional().messages({
      "array.max": "Maximum 5 attachments allowed",
    }),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      phoneNumber: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional(),
      relationship: Joi.string().max(50).optional(),
    }).optional(),
  }),

  // Leave approval validation
  approveLeave: Joi.object({
    status: Joi.string().valid("approved", "rejected").required().messages({
      "any.only": "Status must be approved or rejected",
      "any.required": "Status is required",
    }),
    comments: Joi.string().max(500).optional().messages({
      "string.max": "Comments cannot exceed 500 characters",
    }),
    approvedBy: Joi.string().uuid().required().messages({
      "string.guid": "Invalid approver ID format",
      "any.required": "Approver ID is required",
    }),
  }),

  // Leave ID validation
  leaveId: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid leave ID format",
      "any.required": "Leave ID is required",
    }),
  }),

  // Leave filters validation
  leaveFilters: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    leaveType: Joi.string()
      .valid(
        "annual",
        "sick",
        "personal",
        "maternity",
        "paternity",
        "bereavement",
        "unpaid"
      )
      .optional(),
    status: Joi.string()
      .valid("pending", "approved", "rejected", "cancelled")
      .optional(),
    startDateFrom: Joi.date().max("now").optional(),
    startDateTo: Joi.date().max("now").optional(),
    endDateFrom: Joi.date().max("now").optional(),
    endDateTo: Joi.date().max("now").optional(),
    department: Joi.string().max(100).optional(),
    search: Joi.string().max(100).optional(),
  }),

  // Leave query options validation
  leaveOptions: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid("startDate", "endDate", "createdAt", "updatedAt", "status")
      .default("startDate"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
    includeEmployee: Joi.boolean().default(false),
    includeApprovals: Joi.boolean().default(false),
  }),

  // Cancel leave validation
  cancelLeave: Joi.object({
    reason: Joi.string().min(10).max(500).required().messages({
      "string.min": "Cancellation reason must be at least 10 characters long",
      "string.max": "Cancellation reason cannot exceed 500 characters",
      "any.required": "Cancellation reason is required",
    }),
  }),

  // Leave balance validation
  leaveBalance: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
    year: Joi.number()
      .integer()
      .min(2020)
      .max(2030)
      .default(() => new Date().getFullYear())
      .messages({
        "number.base": "Year must be a number",
        "number.integer": "Year must be an integer",
        "number.min": "Year must be 2020 or later",
        "number.max": "Year must be 2030 or earlier",
      }),
  }),
};

module.exports = leaveSchemas;
