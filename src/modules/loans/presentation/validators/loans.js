const Joi = require("joi");

const createLoan = Joi.object({
  employeeId: Joi.string().uuid().required(),
  loanType: Joi.string()
    .valid("personal", "emergency", "education", "medical", "housing")
    .required(),
  amount: Joi.number().positive().precision(2).required(),
  purpose: Joi.string().required().min(10).max(500),
  interestRate: Joi.number().precision(2).min(0).max(100).default(0),
  termMonths: Joi.number().integer().min(1).max(120).required(),
  guarantorName: Joi.string().optional().max(100),
  guarantorPhone: Joi.string().optional().max(20),
  guarantorRelationship: Joi.string().optional().max(50),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  notes: Joi.string().optional().max(500),
});

const updateLoan = Joi.object({
  loanType: Joi.string()
    .valid("personal", "emergency", "education", "medical", "housing")
    .optional(),
  amount: Joi.number().positive().precision(2).optional(),
  purpose: Joi.string().optional().min(10).max(500),
  interestRate: Joi.number().precision(2).min(0).max(100).optional(),
  termMonths: Joi.number().integer().min(1).max(120).optional(),
  guarantorName: Joi.string().optional().max(100),
  guarantorPhone: Joi.string().optional().max(20),
  guarantorRelationship: Joi.string().optional().max(50),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  notes: Joi.string().optional().max(500),
});

const approveLoan = Joi.object({
  approvedAmount: Joi.number().positive().precision(2).optional(),
  startDate: Joi.date().iso().optional(),
});

const rejectLoan = Joi.object({
  reason: Joi.string().required().min(10).max(500),
});

const loanId = Joi.object({
  id: Joi.string().uuid().required(),
});

const loanFilters = Joi.object({
  employeeId: Joi.string().uuid().optional(),
  loanType: Joi.string()
    .valid("personal", "emergency", "education", "medical", "housing")
    .optional(),
  status: Joi.string()
    .valid(
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "defaulted"
    )
    .optional(),
  search: Joi.string().optional(),
  minAmount: Joi.number().positive().precision(2).optional(),
  maxAmount: Joi.number().positive().precision(2).optional(),
});

const loanOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "amount", "startDate", "endDate")
    .default("createdAt"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
});

const leaveBalance = Joi.object({
  year: Joi.number()
    .integer()
    .min(2020)
    .max(2030)
    .default(new Date().getFullYear()),
});

module.exports = {
  createLoan,
  updateLoan,
  approveLoan,
  rejectLoan,
  loanId,
  loanFilters,
  loanOptions,
  leaveBalance,
};
