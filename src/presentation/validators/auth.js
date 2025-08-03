const Joi = require("joi");

/**
 * Authentication Validation Schemas
 */

// Phone number validation pattern
const phonePattern = /^\+?[\d\s\-\(\)]{10,15}$/;

// Login schema
const loginSchema = {
  body: Joi.object({
    phoneNumber: Joi.string().pattern(phonePattern).required().messages({
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
  }),
};

// OTP login schema
const otpLoginSchema = {
  body: Joi.object({
    phoneNumber: Joi.string().pattern(phonePattern).required().messages({
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be 6 digits",
        "any.required": "OTP is required",
      }),
  }),
};

// OTP request schema
const otpRequestSchema = {
  body: Joi.object({
    phoneNumber: Joi.string().pattern(phonePattern).required().messages({
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
  }),
};

// Refresh token schema
const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
    }),
  }),
};

// Change password schema
const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().min(6).required().messages({
      "string.min": "Current password must be at least 6 characters long",
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.min": "New password must be at least 6 characters long",
      "any.required": "New password is required",
    }),
  }),
};

// Forgot password schema
const forgotPasswordSchema = {
  body: Joi.object({
    phoneNumber: Joi.string().pattern(phonePattern).required().messages({
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
  }),
};

// Reset password schema
const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.min": "New password must be at least 6 characters long",
      "any.required": "New password is required",
    }),
  }),
};

// Update profile schema
const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).optional().messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
    }),
    lastName: Joi.string().min(2).max(50).optional().messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
    }),
    email: Joi.string().email().optional().messages({
      "string.email": "Invalid email format",
    }),
    phoneNumber: Joi.string().pattern(phonePattern).optional().messages({
      "string.pattern.base": "Invalid phone number format",
    }),
    preferences: Joi.object().optional(),
  }),
};

module.exports = {
  loginSchema,
  otpLoginSchema,
  otpRequestSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
