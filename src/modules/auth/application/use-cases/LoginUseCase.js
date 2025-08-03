const jwt = require("jsonwebtoken");
const config = require("../../../config/index");
const {
  ValidationError,
  AuthenticationError,
} = require("../../../domain/errors");

/**
 * Login Use Case
 * Handles user authentication via phone number and password or OTP
 */
class LoginUseCase {
  constructor(userRepository, notificationService) {
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  /**
   * Execute login with phone and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.phoneNumber - User phone number
   * @param {string} credentials.password - User password
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Authentication result
   */
  async executeWithPassword(credentials, deviceInfo = {}) {
    try {
      // Validate input
      this.validateCredentials(credentials);

      const { phoneNumber, password } = credentials;

      // Find user by phone number
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new AuthenticationError("Invalid phone number or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError("Account is deactivated");
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid phone number or password");
      }

      // Update last login
      await user.updateLastLogin();

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      await this.userRepository.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        tokens.refreshTokenExpiresAt
      );

      // Send login notification
      await this.sendLoginNotification(user, deviceInfo);

      return {
        user: this.sanitizeUser(user),
        tokens,
        deviceInfo,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Execute login with phone and OTP
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.phoneNumber - User phone number
   * @param {string} credentials.otp - One-time password
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Object>} Authentication result
   */
  async executeWithOTP(credentials, deviceInfo = {}) {
    try {
      // Validate input
      this.validateOTPCredentials(credentials);

      const { phoneNumber, otp } = credentials;

      // Find user by phone number
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new AuthenticationError("Invalid phone number or OTP");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError("Account is deactivated");
      }

      // Verify OTP (implementation depends on OTP service)
      const isOTPValid = await this.verifyOTP(phoneNumber, otp);
      if (!isOTPValid) {
        throw new AuthenticationError("Invalid or expired OTP");
      }

      // Update last login
      await user.updateLastLogin();

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      await this.userRepository.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        tokens.refreshTokenExpiresAt
      );

      // Send login notification
      await this.sendLoginNotification(user, deviceInfo);

      return {
        user: this.sanitizeUser(user),
        tokens,
        deviceInfo,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request OTP for login
   * @param {string} phoneNumber - User phone number
   * @returns {Promise<Object>} OTP request result
   */
  async requestOTP(phoneNumber) {
    try {
      // Validate phone number
      if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
        throw new ValidationError("Invalid phone number");
      }

      // Check if user exists
      const user = await this.userRepository.findByPhone(phoneNumber);
      if (!user) {
        throw new AuthenticationError("Phone number not registered");
      }

      if (!user.isActive) {
        throw new AuthenticationError("Account is deactivated");
      }

      // Generate and send OTP
      const otp = this.generateOTP();
      await this.sendOTP(phoneNumber, otp);

      // Store OTP for verification (with expiration)
      await this.storeOTP(phoneNumber, otp);

      return {
        message: "OTP sent successfully",
        phoneNumber: this.maskPhoneNumber(phoneNumber),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate login credentials
   * @param {Object} credentials - Login credentials
   */
  validateCredentials(credentials) {
    const { phoneNumber, password } = credentials;

    if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
      throw new ValidationError("Invalid phone number");
    }

    if (!password || password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }
  }

  /**
   * Validate OTP credentials
   * @param {Object} credentials - OTP credentials
   */
  validateOTPCredentials(credentials) {
    const { phoneNumber, otp } = credentials;

    if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
      throw new ValidationError("Invalid phone number");
    }

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new ValidationError("Invalid OTP format");
    }
  }

  /**
   * Generate JWT tokens
   * @param {Object} user - User object
   * @returns {Object} Access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      employeeId: user.employeeId,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Sanitize user object for response
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const {
      password,
      refreshToken,
      refreshTokenExpiresAt,
      loginAttempts,
      lockedUntil,
      ...sanitizedUser
    } = user.toJSON();
    return sanitizedUser;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Validation result
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Mask phone number for privacy
   * @param {string} phoneNumber - Phone number to mask
   * @returns {string} Masked phone number
   */
  maskPhoneNumber(phoneNumber) {
    if (phoneNumber.length <= 4) return phoneNumber;
    return phoneNumber.slice(-4).padStart(phoneNumber.length, "*");
  }

  /**
   * Generate OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Verify OTP (placeholder - implement with actual OTP service)
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP to verify
   * @returns {Promise<boolean>} Verification result
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      // TODO: Implement actual OTP verification logic
      // This is a placeholder implementation that can be replaced with:
      // - Redis cache verification
      // - Database OTP storage verification
      // - Third-party OTP service integration

      // For now, we'll use a simple in-memory store (not production ready)
      const storedOTP = this.otpStore.get(phoneNumber);
      if (!storedOTP) {
        return false;
      }

      // Check if OTP is expired (5 minutes)
      if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
        this.otpStore.delete(phoneNumber);
        return false;
      }

      // Check if OTP matches
      if (storedOTP.otp === otp) {
        this.otpStore.delete(phoneNumber);
        return true;
      }

      return false;
    } catch (error) {
      console.error("OTP verification error:", error);
      return false;
    }
  }

  /**
   * Send OTP (placeholder - implement with actual SMS service)
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP to send
   * @returns {Promise<void>}
   */
  async sendOTP(phoneNumber, otp) {
    try {
      // TODO: Implement actual SMS sending logic
      // This is a placeholder implementation that can be replaced with:
      // - Twilio SMS service
      // - AWS SNS
      // - Other SMS providers

      console.log(`OTP ${otp} sent to ${phoneNumber}`);

      // For development/testing purposes, log the OTP
      if (process.env.NODE_ENV === "development") {
        console.log(`🔐 Development OTP for ${phoneNumber}: ${otp}`);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw new Error("Failed to send OTP");
    }
  }

  /**
   * Store OTP for verification (placeholder - implement with cache/DB)
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP to store
   * @returns {Promise<void>}
   */
  async storeOTP(phoneNumber, otp) {
    try {
      // TODO: Implement OTP storage with expiration
      // This is a placeholder implementation that can be replaced with:
      // - Redis cache with TTL
      // - Database storage with expiration
      // - In-memory store (not recommended for production)

      // Initialize OTP store if not exists
      if (!this.otpStore) {
        this.otpStore = new Map();
      }

      // Store OTP with timestamp
      this.otpStore.set(phoneNumber, {
        otp,
        timestamp: Date.now(),
      });

      console.log(`OTP ${otp} stored for ${phoneNumber}`);
    } catch (error) {
      console.error("Error storing OTP:", error);
      throw new Error("Failed to store OTP");
    }
  }

  /**
   * Send login notification
   * @param {Object} user - User object
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<void>}
   */
  async sendLoginNotification(user, deviceInfo) {
    try {
      // Only send notification if notification service is available
      if (
        this.notificationService &&
        typeof this.notificationService.sendLoginAlert === "function"
      ) {
        await this.notificationService.sendLoginAlert(user, deviceInfo);
      } else {
        // Log login event for audit purposes
        console.log(
          `Login event: User ${user.id} logged in from ${
            deviceInfo.ip || "unknown IP"
          } at ${new Date().toISOString()}`
        );
      }
    } catch (error) {
      // Log error but don't fail login
      console.error("Failed to send login notification:", error);
    }
  }
}

module.exports = LoginUseCase;
