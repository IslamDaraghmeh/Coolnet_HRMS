const { ValidationError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");

/**
 * Logout Use Case
 * Handles user logout business logic
 */
class LogoutUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Execute logout
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Logout result
   */
  async execute(userId) {
    try {
      // Validate user ID
      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ValidationError("User not found");
      }

      // Clear refresh token
      await this.userRepository.updateRefreshToken(userId, null, null);

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute logout for all devices
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Logout result
   */
  async executeAllDevices(userId) {
    try {
      // Validate user ID
      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      // Find user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ValidationError("User not found");
      }

      // Clear refresh token
      await this.userRepository.updateRefreshToken(userId, null, null);

      return {
        success: true,
        message: "Logged out from all devices successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LogoutUseCase;
