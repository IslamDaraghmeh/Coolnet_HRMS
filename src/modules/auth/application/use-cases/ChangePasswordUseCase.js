const bcrypt = require("bcryptjs");
const { ValidationError, UnauthorizedError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");

/**
 * Change Password Use Case
 * Handles authenticated password change business logic
 */
class ChangePasswordUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Execute password change
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise<Object>} Change password result
   */
  async execute(userId, currentPassword, newPassword, confirmPassword) {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      if (!currentPassword) {
        throw new ValidationError("Current password is required");
      }

      if (!newPassword) {
        throw new ValidationError("New password is required");
      }

      if (!confirmPassword) {
        throw new ValidationError("Confirm password is required");
      }

      if (newPassword !== confirmPassword) {
        throw new ValidationError(
          "New password and confirm password do not match"
        );
      }

      if (currentPassword === newPassword) {
        throw new ValidationError(
          "New password must be different from current password"
        );
      }

      // Validate password strength
      this.validatePassword(newPassword);

      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ValidationError("User not found");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError("User account is inactive");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      });

      // Clear any existing refresh tokens to force re-login
      await this.userRepository.updateRefreshToken(user.id, null, null);

      return {
        success: true,
        message: "Password changed successfully. Please log in again.",
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
}

module.exports = ChangePasswordUseCase;
