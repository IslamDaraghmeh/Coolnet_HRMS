const jwt = require("jsonwebtoken");
const { ValidationError, UnauthorizedError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");
const AuthService = require("../../services/AuthService");

/**
 * Refresh Token Use Case
 * Handles JWT token refresh business logic
 */
class RefreshTokenUseCase {
  constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
  }

  /**
   * Execute token refresh
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Refresh result
   */
  async execute(refreshToken) {
    try {
      // Validate refresh token
      if (!refreshToken) {
        throw new ValidationError("Refresh token is required");
      }

      // Verify refresh token
      const decoded = await this.verifyRefreshToken(refreshToken);

      // Find user by ID
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError("User account is inactive");
      }

      // Verify stored refresh token
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      // Check if refresh token is expired
      if (
        user.refreshTokenExpiresAt &&
        new Date() > user.refreshTokenExpiresAt
      ) {
        throw new UnauthorizedError("Refresh token has expired");
      }

      // Generate new access token
      const accessToken = this.authService.generateAccessToken({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        employeeId: user.employeeId,
      });

      // Generate new refresh token
      const newRefreshToken = this.authService.generateRefreshToken({
        userId: user.id,
      });

      // Update user's refresh token
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // 30 days

      await this.userRepository.updateRefreshToken(
        user.id,
        newRefreshToken,
        refreshTokenExpiresAt
      );

      // Update last login
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });

      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "1h",
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            employeeId: user.employeeId,
            isActive: user.isActive,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify refresh token
   * @param {string} refreshToken - Refresh token to verify
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedError("Refresh token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedError("Invalid refresh token");
      } else {
        throw new UnauthorizedError("Token verification failed");
      }
    }
  }
}

module.exports = RefreshTokenUseCase;
