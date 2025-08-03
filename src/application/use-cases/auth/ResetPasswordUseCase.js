const bcrypt = require("bcryptjs");
const { ValidationError, UnauthorizedError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");

/**
 * Reset Password Use Case
 * Handles password reset completion business logic
 */
class ResetPasswordUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Execute password reset
   * @param {string} resetToken - Reset token
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise<Object>} Reset password result
   */
  async execute(resetToken, newPassword, confirmPassword) {
    try {
      // Validate input
      if (!resetToken) {
        throw new ValidationError("Reset token is required");
      }

      if (!newPassword) {
        throw new ValidationError("New password is required");
      }

      if (!confirmPassword) {
        throw new ValidationError("Confirm password is required");
      }

      if (newPassword !== confirmPassword) {
        throw new ValidationError("Password and confirm password do not match");
      }

      // Validate password strength
      this.validatePassword(newPassword);

      // Find user by reset token
      const user = await this.findUserByResetToken(resetToken);
      if (!user) {
        throw new UnauthorizedError("Invalid or expired reset token");
      }

      // Check if reset token is expired
      if (
        user.resetPasswordExpiresAt &&
        new Date() > user.resetPasswordExpiresAt
      ) {
        throw new UnauthorizedError("Reset token has expired");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and clear reset token
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
      });

      // Clear any existing refresh tokens
      await this.userRepository.updateRefreshToken(user.id, null, null);

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   */
  validatePassword(password) {
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one lowercase letter"
      );
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one uppercase letter"
      );
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }
  }

  /**
   * Find user by reset token
   * @param {string} resetToken - Reset token
   * @returns {Promise<Object|null>} User or null
   */
  async findUserByResetToken(resetToken) {
    try {
      const { Op } = require("sequelize");
      const User = require("../../../domain/entities/User");

      const user = await User.findOne({
        where: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: {
            [Op.gt]: new Date(),
          },
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to find user by reset token: ${error.message}`);
    }
  }
}

module.exports = ResetPasswordUseCase;
