const Joi = require("joi");

/**
 * Attendance validation schemas
 */
const attendanceSchemas = {
  // Check in validation
  checkIn: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().max(200).optional(),
    }).optional(),
    notes: Joi.string().max(500).optional(),
  }),

  // Check out validation
  checkOut: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().max(200).optional(),
    }).optional(),
    notes: Joi.string().max(500).optional(),
  }),

  // Manual attendance entry validation
  manualEntry: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid employee ID format",
      "any.required": "Employee ID is required",
    }),
    date: Joi.date().max("now").required().messages({
      "date.max": "Date cannot be in the future",
      "any.required": "Date is required",
    }),
    checkInTime: Joi.date().max("now").required().messages({
      "date.max": "Check-in time cannot be in the future",
      "any.required": "Check-in time is required",
    }),
    checkOutTime: Joi.date()
      .max("now")
      .greater(Joi.ref("checkInTime"))
      .optional()
      .messages({
        "date.max": "Check-out time cannot be in the future",
        "date.greater": "Check-out time must be after check-in time",
      }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      address: Joi.string().max(200).optional(),
    }).optional(),
    notes: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid("regular", "overtime", "holiday", "weekend")
      .default("regular")
      .messages({
        "any.only": "Type must be regular, overtime, holiday, or weekend",
      }),
  }),

  // Update attendance validation
  updateAttendance: Joi.object({
    checkInTime: Joi.date().max("now").optional().messages({
      "date.max": "Check-in time cannot be in the future",
    }),
    checkOutTime: Joi.date()
      .max("now")
      .greater(Joi.ref("checkInTime"))
      .optional()
      .messages({
        "date.max": "Check-out time cannot be in the future",
        "date.greater": "Check-out time must be after check-in time",
      }),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      address: Joi.string().max(200).optional(),
    }).optional(),
    notes: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid("regular", "overtime", "holiday", "weekend")
      .optional()
      .messages({
        "any.only": "Type must be regular, overtime, holiday, or weekend",
      }),
    status: Joi.string()
      .valid("present", "absent", "late", "early_departure", "half_day")
      .optional()
      .messages({
        "any.only":
          "Status must be present, absent, late, early_departure, or half_day",
      }),
  }),

  // Attendance ID validation
  attendanceId: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "Invalid attendance ID format",
      "any.required": "Attendance ID is required",
    }),
  }),

  // Attendance filters validation
  attendanceFilters: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    dateFrom: Joi.date().max("now").optional(),
    dateTo: Joi.date().max("now").optional(),
    status: Joi.string()
      .valid("present", "absent", "late", "early_departure", "half_day")
      .optional(),
    type: Joi.string()
      .valid("regular", "overtime", "holiday", "weekend")
      .optional(),
    department: Joi.string().max(100).optional(),
    search: Joi.string().max(100).optional(),
  }),

  // Attendance query options validation
  attendanceOptions: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid("date", "checkInTime", "checkOutTime", "createdAt", "updatedAt")
      .default("date"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
    includeEmployee: Joi.boolean().default(false),
  }),

  // Bulk attendance import validation
  bulkImport: Joi.object({
    data: Joi.array()
      .items(
        Joi.object({
          employeeId: Joi.string().uuid().required(),
          date: Joi.date().max("now").required(),
          checkInTime: Joi.date().max("now").required(),
          checkOutTime: Joi.date()
            .max("now")
            .greater(Joi.ref("checkInTime"))
            .optional(),
          type: Joi.string()
            .valid("regular", "overtime", "holiday", "weekend")
            .default("regular"),
          status: Joi.string()
            .valid("present", "absent", "late", "early_departure", "half_day")
            .default("present"),
          notes: Joi.string().max(500).optional(),
        })
      )
      .min(1)
      .max(1000)
      .required()
      .messages({
        "array.min": "At least one attendance record is required",
        "array.max": "Maximum 1000 records can be imported at once",
        "any.required": "Data is required",
      }),
  }),
};

module.exports = attendanceSchemas;
