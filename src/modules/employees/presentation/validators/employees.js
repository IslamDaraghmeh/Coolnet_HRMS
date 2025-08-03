const Joi = require("joi");

/**
 * Employee validation schemas
 */
const employeeSchemas = {
  // Create employee validation
  createEmployee: Joi.object({
    employeeId: Joi.string()
      .pattern(/^[A-Z0-9]{6,10}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Employee ID must be 6-10 characters long and contain only uppercase letters and numbers",
        "any.required": "Employee ID is required",
      }),
    firstName: Joi.string().min(2).max(50).required().messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),
    dateOfBirth: Joi.date().max("now").required().messages({
      "date.max": "Date of birth cannot be in the future",
      "any.required": "Date of birth is required",
    }),
    gender: Joi.string().valid("male", "female", "other").required().messages({
      "any.only": "Gender must be male, female, or other",
      "any.required": "Gender is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
        "any.required": "Phone number is required",
      }),
    address: Joi.object({
      street: Joi.string().max(100).required(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      zipCode: Joi.string().max(10).required(),
      country: Joi.string().max(50).required(),
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).required(),
      relationship: Joi.string().max(50).required(),
      phoneNumber: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .required(),
      email: Joi.string().email().optional(),
    }).required(),
    hireDate: Joi.date().max("now").required().messages({
      "date.max": "Hire date cannot be in the future",
      "any.required": "Hire date is required",
    }),
    position: Joi.string().min(2).max(100).required().messages({
      "string.min": "Position must be at least 2 characters long",
      "string.max": "Position cannot exceed 100 characters",
      "any.required": "Position is required",
    }),
    department: Joi.string().min(2).max(100).required().messages({
      "string.min": "Department must be at least 2 characters long",
      "string.max": "Department cannot exceed 100 characters",
      "any.required": "Department is required",
    }),
    salary: Joi.number().positive().required().messages({
      "number.base": "Salary must be a number",
      "number.positive": "Salary must be positive",
      "any.required": "Salary is required",
    }),
    managerId: Joi.string().uuid().optional(),
    isActive: Joi.boolean().default(true),
  }),

  // Update employee validation
  updateEmployee: Joi.object({
    firstName: Joi.string().min(2).max(50).optional().messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
    }),
    lastName: Joi.string().min(2).max(50).optional().messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
    }),
    dateOfBirth: Joi.date().max("now").optional().messages({
      "date.max": "Date of birth cannot be in the future",
    }),
    gender: Joi.string().valid("male", "female", "other").optional().messages({
      "any.only": "Gender must be male, female, or other",
    }),
    email: Joi.string().email().optional().messages({
      "string.email": "Please provide a valid email address",
    }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
      }),
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(10).optional(),
      country: Joi.string().max(50).optional(),
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phoneNumber: Joi.string()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional(),
      email: Joi.string().email().optional(),
    }).optional(),
    hireDate: Joi.date().max("now").optional().messages({
      "date.max": "Hire date cannot be in the future",
    }),
    position: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Position must be at least 2 characters long",
      "string.max": "Position cannot exceed 100 characters",
    }),
    department: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Department must be at least 2 characters long",
      "string.max": "Department cannot exceed 100 characters",
    }),
    salary: Joi.number().positive().optional().messages({
      "number.base": "Salary must be a number",
      "number.positive": "Salary must be positive",
    }),
    managerId: Joi.string().uuid().optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Employee ID validation
  employeeId: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
  }),

  // Employee filters validation
  employeeFilters: Joi.object({
    department: Joi.string().max(100).optional(),
    position: Joi.string().max(100).optional(),
    status: Joi.string().valid("active", "inactive").optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    hireDateFrom: Joi.date().max("now").optional(),
    hireDateTo: Joi.date().max("now").optional(),
    minSalary: Joi.number().positive().optional(),
    maxSalary: Joi.number().positive().optional(),
    search: Joi.string().max(100).optional(),
  }),

  // Employee query options validation
  employeeOptions: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid(
        "createdAt",
        "updatedAt",
        "firstName",
        "lastName",
        "employeeId",
        "hireDate",
        "salary",
        "department",
        "position"
      )
      .default("createdAt"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
    includeUser: Joi.boolean().default(false),
    includeAttendance: Joi.boolean().default(false),
    includeLeaves: Joi.boolean().default(false),
    includePerformance: Joi.boolean().default(false),
  }),
};

module.exports = employeeSchemas;
