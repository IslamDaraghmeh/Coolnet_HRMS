const Joi = require("joi");

const createPerformanceReview = Joi.object({
  employeeId: Joi.string().uuid().required(),
  reviewerId: Joi.string().uuid().required(),
  reviewPeriod: Joi.string().required().min(3).max(50),
  reviewDate: Joi.date().iso().required(),
  nextReviewDate: Joi.date().iso().optional().greater(Joi.ref("reviewDate")),
  overallRating: Joi.number().integer().min(1).max(5).optional(),
  performanceScore: Joi.number().precision(2).min(0).max(100).optional(),
  goals: Joi.array()
    .items(
      Joi.object({
        goal: Joi.string().required(),
        target: Joi.string().required(),
        achieved: Joi.boolean().default(false),
        notes: Joi.string().optional(),
      })
    )
    .optional(),
  achievements: Joi.array()
    .items(
      Joi.object({
        achievement: Joi.string().required(),
        impact: Joi.string().required(),
        date: Joi.date().iso().optional(),
      })
    )
    .optional(),
  areasOfImprovement: Joi.array().items(Joi.string()).optional(),
  strengths: Joi.array().items(Joi.string()).optional(),
  weaknesses: Joi.array().items(Joi.string()).optional(),
  recommendations: Joi.array()
    .items(
      Joi.object({
        recommendation: Joi.string().required(),
        priority: Joi.string().valid("low", "medium", "high").required(),
        timeline: Joi.string().optional(),
      })
    )
    .optional(),
  employeeComments: Joi.string().optional().max(1000),
  reviewerComments: Joi.string().optional().max(1000),
  hrComments: Joi.string().optional().max(1000),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  isConfidential: Joi.boolean().default(true),
});

const updatePerformanceReview = Joi.object({
  reviewPeriod: Joi.string().optional().min(3).max(50),
  reviewDate: Joi.date().iso().optional(),
  nextReviewDate: Joi.date().iso().optional(),
  overallRating: Joi.number().integer().min(1).max(5).optional(),
  performanceScore: Joi.number().precision(2).min(0).max(100).optional(),
  goals: Joi.array()
    .items(
      Joi.object({
        goal: Joi.string().required(),
        target: Joi.string().required(),
        achieved: Joi.boolean().default(false),
        notes: Joi.string().optional(),
      })
    )
    .optional(),
  achievements: Joi.array()
    .items(
      Joi.object({
        achievement: Joi.string().required(),
        impact: Joi.string().required(),
        date: Joi.date().iso().optional(),
      })
    )
    .optional(),
  areasOfImprovement: Joi.array().items(Joi.string()).optional(),
  strengths: Joi.array().items(Joi.string()).optional(),
  weaknesses: Joi.array().items(Joi.string()).optional(),
  recommendations: Joi.array()
    .items(
      Joi.object({
        recommendation: Joi.string().required(),
        priority: Joi.string().valid("low", "medium", "high").required(),
        timeline: Joi.string().optional(),
      })
    )
    .optional(),
  employeeComments: Joi.string().optional().max(1000),
  reviewerComments: Joi.string().optional().max(1000),
  hrComments: Joi.string().optional().max(1000),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  isConfidential: Joi.boolean().optional(),
});

const performanceReviewId = Joi.object({
  id: Joi.string().uuid().required(),
});

const performanceFilters = Joi.object({
  employeeId: Joi.string().uuid().optional(),
  reviewerId: Joi.string().uuid().optional(),
  reviewPeriod: Joi.string().optional(),
  status: Joi.string()
    .valid("draft", "in_progress", "completed", "approved")
    .optional(),
  search: Joi.string().optional(),
  minRating: Joi.number().integer().min(1).max(5).optional(),
  maxRating: Joi.number().integer().min(1).max(5).optional(),
});

const performanceOptions = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("reviewDate", "createdAt", "overallRating", "performanceScore")
    .default("reviewDate"),
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
  createPerformanceReview,
  updatePerformanceReview,
  performanceReviewId,
  performanceFilters,
  performanceOptions,
  leaveBalance,
};
