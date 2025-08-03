const jwt = require("jsonwebtoken");
const config = require("../../config/index");
const { AuthenticationError, ValidationError } = require("../../domain/errors");

/**
 * Authentication Service
 * Handles JWT token management and authentication utilities
 */
class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verify access token
   * @param {string} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new AuthenticationError("Invalid or expired access token");
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - JWT refresh token
   * @returns {Object} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError("User not found or inactive");
      }

      // Check if refresh token matches stored token
      if (user.refreshToken !== refreshToken) {
        throw new AuthenticationError("Invalid refresh token");
      }

      // Check if refresh token is expired
      if (
        user.refreshTokenExpiresAt &&
        new Date() > new Date(user.refreshTokenExpiresAt)
      ) {
        throw new AuthenticationError("Refresh token expired");
      }

      // Generate new access token
      const payload = {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        employeeId: user.employeeId,
      };

      const newAccessToken = this.generateAccessToken(payload);

      return {
        accessToken: newAccessToken,
        expiresIn: config.jwt.expiresIn,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke refresh token
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async revokeRefreshToken(userId) {
    try {
      await this.userRepository.updateRefreshToken(userId, null, null);
    } catch (error) {
      throw new Error("Failed to revoke refresh token");
    }
  }

  /**
   * Revoke all refresh tokens for user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async revokeAllRefreshTokens(userId) {
    try {
      await this.userRepository.updateRefreshToken(userId, null, null);
    } catch (error) {
      throw new Error("Failed to revoke all refresh tokens");
    }
  }

  /**
   * Extract token from authorization header
   * @param {string} authHeader - Authorization header
   * @returns {string} Token
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new ValidationError("Authorization header is required");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new ValidationError("Invalid authorization header format");
    }

    return parts[1];
  }

  /**
   * Get user from token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User object
   */
  async getUserFromToken(token) {
    try {
      const decoded = this.verifyAccessToken(token);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new AuthenticationError("User not found or inactive");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate token and return user
   * @param {string} authHeader - Authorization header
   * @returns {Promise<Object>} User object
   */
  async validateTokenAndGetUser(authHeader) {
    try {
      const token = this.extractTokenFromHeader(authHeader);
      return await this.getUserFromToken(token);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate password reset token
   * @param {string} userId - User ID
   * @returns {string} Reset token
   */
  generatePasswordResetToken(userId) {
    return jwt.sign({ userId, type: "password_reset" }, config.jwt.secret, {
      expiresIn: "1h",
    });
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Object} Decoded token payload
   */
  verifyPasswordResetToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      if (decoded.type !== "password_reset") {
        throw new AuthenticationError("Invalid token type");
      }
      return decoded;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired reset token");
    }
  }

  /**
   * Generate email verification token
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @returns {string} Verification token
   */
  generateEmailVerificationToken(userId, email) {
    return jwt.sign(
      { userId, email, type: "email_verification" },
      config.jwt.secret,
      { expiresIn: "24h" }
    );
  }

  /**
   * Verify email verification token
   * @param {string} token - Verification token
   * @returns {Object} Decoded token payload
   */
  verifyEmailVerificationToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      if (decoded.type !== "email_verification") {
        throw new AuthenticationError("Invalid token type");
      }
      return decoded;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired verification token");
    }
  }

  /**
   * Generate temporary access token (for specific operations)
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Expiration time
   * @returns {string} Temporary token
   */
  generateTemporaryToken(payload, expiresIn = "15m") {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  /**
   * Decode token without verification
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = AuthService;
