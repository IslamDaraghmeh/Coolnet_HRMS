const Joi = require("joi");

const createBranch = Joi.object({
  name: Joi.string().required().min(2).max(100),
  code: Joi.string()
    .required()
    .min(2)
    .max(10)
    .pattern(/^[A-Z0-9]+$/),
  description: Joi.string().optional().max(500),
  address: Joi.object({
    street: Joi.string().required().max(200),
    city: Joi.string().required().max(100),
    state: Joi.string().optional().max(100),
    country: Joi.string().required().max(100),
    postalCode: Joi.string().optional().max(20),
  }).required(),
  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required().max(20),
    fax: Joi.string().optional().max(20),
  }).required(),
  managerId: Joi.string().uuid().optional(),
  parentBranchId: Joi.string().uuid().optional(),
  timezone: Joi.string().optional().max(50),
  workingHours: Joi.object({
    monday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    tuesday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    wednesday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    thursday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    friday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    saturday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    sunday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
  }).optional(),
  capacity: Joi.number().integer().min(1).max(10000).optional(),
  facilities: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid("active", "inactive", "maintenance", "closed")
    .default("active"),
  isHeadquarters: Joi.boolean().default(false),
  establishedDate: Joi.date().iso().optional(),
  notes: Joi.string().optional().max(1000),
});

const updateBranch = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  code: Joi.string()
    .optional()
    .min(2)
    .max(10)
    .pattern(/^[A-Z0-9]+$/),
  description: Joi.string().optional().max(500),
  address: Joi.object({
    street: Joi.string().required().max(200),
    city: Joi.string().required().max(100),
    state: Joi.string().optional().max(100),
    country: Joi.string().required().max(100),
    postalCode: Joi.string().optional().max(20),
  }).optional(),
  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required().max(20),
    fax: Joi.string().optional().max(20),
  }).optional(),
  managerId: Joi.string().uuid().optional(),
  parentBranchId: Joi.string().uuid().optional(),
  timezone: Joi.string().optional().max(50),
  workingHours: Joi.object({
    monday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    tuesday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    wednesday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    thursday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    friday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    saturday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
    sunday: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isWorking: Joi.boolean().required(),
    }).optional(),
  }).optional(),
  capacity: Joi.number().integer().min(1).max(10000).optional(),
  facilities: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid("active", "inactive", "maintenance", "closed")
    .optional(),
  isHeadquarters: Joi.boolean().optional(),
  establishedDate: Joi.date().iso().optional(),
  notes: Joi.string().optional().max(1000),
});

const branchId = Joi.object({
  id: Joi.string().uuid().required(),
});

const branchFilters = Joi.object({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid("active", "inactive", "maintenance", "closed")
    .optional(),
  isHeadquarters: Joi.boolean().optional(),
  managerId: Joi.string().uuid().optional(),
  parentBranchId: Joi.string().uuid().optional(),
});

const branchOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("name", "code", "status", "createdAt")
    .default("name"),
  sortOrder: Joi.string().valid("ASC", "DESC").default("ASC"),
});

module.exports = {
  createBranch,
  updateBranch,
  branchId,
  branchFilters,
  branchOptions,
};
