const { ValidationError } = require("../../utils/errors");

/**
 * Validation Middleware
 * Validates request data using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError("Validation failed", errors);
        }

        req.body = value;
      }

      // Validate query parameters
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: `query.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError("Query validation failed", errors);
        }

        req.query = value;
      }

      // Validate URL parameters
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: `params.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError("Parameter validation failed", errors);
        }

        req.params = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateRequest,
};
