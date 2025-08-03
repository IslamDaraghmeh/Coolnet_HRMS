const { body, param, query, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

/**
 * Validate UUID format
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (value) => {
  if (!value) return true; // Allow null/undefined for optional fields
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validate department code format
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid department code
 */
const isValidDepartmentCode = (value) => {
  if (!value) return false;
  // Department code should be 2-10 characters, alphanumeric and hyphens only
  const codeRegex = /^[A-Z0-9-]{2,10}$/;
  return codeRegex.test(value.toUpperCase());
};

/**
 * Validate JSON object
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid JSON object
 */
const isValidJSONObject = (value) => {
  if (!value) return true; // Allow null/undefined for optional fields
  if (typeof value === "object" && value !== null) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validation middleware to handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * Validate create department request
 */
const validateCreateDepartment = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
    .withMessage("Department name contains invalid characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Department code is required")
    .custom(isValidDepartmentCode)
    .withMessage(
      "Department code must be 2-10 characters, alphanumeric and hyphens only"
    )
    .toUpperCase(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("parentDepartmentId")
    .optional()
    .custom(isValidUUID)
    .withMessage("Parent department ID must be a valid UUID"),

  body("headId")
    .optional()
    .custom(isValidUUID)
    .withMessage("Department head ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  body("settings")
    .optional()
    .custom(isValidJSONObject)
    .withMessage("Settings must be a valid JSON object"),

  handleValidationErrors,
];

/**
 * Validate update department request
 */
const validateUpdateDepartment = [
  param("id")
    .custom(isValidUUID)
    .withMessage("Department ID must be a valid UUID"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
    .withMessage("Department name contains invalid characters"),

  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department code cannot be empty")
    .custom(isValidDepartmentCode)
    .withMessage(
      "Department code must be 2-10 characters, alphanumeric and hyphens only"
    )
    .toUpperCase(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("parentDepartmentId")
    .optional()
    .custom((value) => {
      if (value === null || value === "") return true; // Allow null/empty to remove parent
      return isValidUUID(value);
    })
    .withMessage("Parent department ID must be a valid UUID or null"),

  body("headId")
    .optional()
    .custom((value) => {
      if (value === null || value === "") return true; // Allow null/empty to remove head
      return isValidUUID(value);
    })
    .withMessage("Department head ID must be a valid UUID or null"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  body("settings")
    .optional()
    .custom(isValidJSONObject)
    .withMessage("Settings must be a valid JSON object"),

  handleValidationErrors,
];

/**
 * Validate department ID parameter
 */
const validateDepartmentId = [
  param("id")
    .custom(isValidUUID)
    .withMessage("Department ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * Validate employee ID parameter
 */
const validateEmployeeId = [
  param("employeeId")
    .custom(isValidUUID)
    .withMessage("Employee ID must be a valid UUID"),

  handleValidationErrors,
];

/**
 * Validate query parameters for listing departments
 */
const validateListDepartments = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term must not exceed 100 characters"),

  query("parentDepartmentId")
    .optional()
    .custom(isValidUUID)
    .withMessage("Parent department ID must be a valid UUID"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  query("includeEmployees")
    .optional()
    .isBoolean()
    .withMessage("includeEmployees must be a boolean value"),

  handleValidationErrors,
];

/**
 * Validate query parameters for listing department employees
 */
const validateListEmployees = [
  param("id")
    .custom(isValidUUID)
    .withMessage("Department ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term must not exceed 100 characters"),

  query("position")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Position must not exceed 50 characters"),

  handleValidationErrors,
];

module.exports = {
  validateCreateDepartment,
  validateUpdateDepartment,
  validateDepartmentId,
  validateEmployeeId,
  validateListDepartments,
  validateListEmployees,
  handleValidationErrors,
};
