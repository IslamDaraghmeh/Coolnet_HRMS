const Joi = require("joi");

const createPayroll = Joi.object({
  employeeId: Joi.string().uuid().required(),
  payPeriod: Joi.string().required().min(3).max(50),
  payDate: Joi.date().iso().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  basicSalary: Joi.number().positive().precision(2).required(),
  allowances: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string().valid("fixed", "percentage").required(),
      })
    )
    .optional(),
  totalAllowances: Joi.number().precision(2).min(0).default(0),
  overtimePay: Joi.number().precision(2).min(0).default(0),
  bonuses: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string()
          .valid("performance", "attendance", "special")
          .required(),
      })
    )
    .optional(),
  totalBonuses: Joi.number().precision(2).min(0).default(0),
  deductions: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string()
          .valid("tax", "insurance", "loan", "other")
          .required(),
      })
    )
    .optional(),
  totalDeductions: Joi.number().precision(2).min(0).default(0),
  taxAmount: Joi.number().precision(2).min(0).default(0),
  insuranceAmount: Joi.number().precision(2).min(0).default(0),
  pensionAmount: Joi.number().precision(2).min(0).default(0),
  loanDeductions: Joi.number().precision(2).min(0).default(0),
  grossPay: Joi.number().positive().precision(2).required(),
  netPay: Joi.number().positive().precision(2).required(),
  workingDays: Joi.number().integer().min(0).max(31).required(),
  overtimeHours: Joi.number().precision(2).min(0).default(0),
  leaveDays: Joi.number().integer().min(0).default(0),
  notes: Joi.string().optional().max(500),
});

const updatePayroll = Joi.object({
  payPeriod: Joi.string().optional().min(3).max(50),
  payDate: Joi.date().iso().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  basicSalary: Joi.number().positive().precision(2).optional(),
  allowances: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string().valid("fixed", "percentage").required(),
      })
    )
    .optional(),
  totalAllowances: Joi.number().precision(2).min(0).optional(),
  overtimePay: Joi.number().precision(2).min(0).optional(),
  bonuses: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string()
          .valid("performance", "attendance", "special")
          .required(),
      })
    )
    .optional(),
  totalBonuses: Joi.number().precision(2).min(0).optional(),
  deductions: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string()
          .valid("tax", "insurance", "loan", "other")
          .required(),
      })
    )
    .optional(),
  totalDeductions: Joi.number().precision(2).min(0).optional(),
  taxAmount: Joi.number().precision(2).min(0).optional(),
  insuranceAmount: Joi.number().precision(2).min(0).optional(),
  pensionAmount: Joi.number().precision(2).min(0).optional(),
  loanDeductions: Joi.number().precision(2).min(0).optional(),
  grossPay: Joi.number().positive().precision(2).optional(),
  netPay: Joi.number().positive().precision(2).optional(),
  workingDays: Joi.number().integer().min(0).max(31).optional(),
  overtimeHours: Joi.number().precision(2).min(0).optional(),
  leaveDays: Joi.number().integer().min(0).optional(),
  notes: Joi.string().optional().max(500),
});

const payPayroll = Joi.object({
  paymentMethod: Joi.string()
    .valid("bank_transfer", "check", "cash")
    .required(),
  referenceNumber: Joi.string().optional().max(50),
});

const generatePayroll = Joi.object({
  payPeriod: Joi.string().required().min(3).max(50),
  employeeIds: Joi.array().items(Joi.string().uuid()).optional(),
});

const payrollId = Joi.object({
  id: Joi.string().uuid().required(),
});

const payrollFilters = Joi.object({
  employeeId: Joi.string().uuid().optional(),
  payPeriod: Joi.string().optional(),
  status: Joi.string()
    .valid("draft", "pending", "approved", "paid", "cancelled")
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  minAmount: Joi.number().positive().precision(2).optional(),
  maxAmount: Joi.number().positive().precision(2).optional(),
  search: Joi.string().optional(),
});

const payrollOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("payDate", "createdAt", "grossPay", "netPay")
    .default("payDate"),
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
  createPayroll,
  updatePayroll,
  payPayroll,
  generatePayroll,
  payrollId,
  payrollFilters,
  payrollOptions,
  leaveBalance,
};
