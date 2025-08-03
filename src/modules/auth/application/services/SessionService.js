const SessionRepository = require("../../infrastructure/db/repositories/SessionRepository");
const UserActivityRepository = require("../../infrastructure/db/repositories/UserActivityRepository");
const AuthService = require("./AuthService");
const DeviceFingerprintService = require("./DeviceFingerprintService");
const config = require("../../config/index");
const crypto = require("crypto");

class SessionService {
  constructor() {
    this.sessionRepository = new SessionRepository();
    this.userActivityRepository = new UserActivityRepository();
    this.deviceFingerprintService = new DeviceFingerprintService();
    const UserRepository = require("../../infrastructure/db/repositories/UserRepository");
    const userRepository = new UserRepository();
    this.authService = new AuthService(userRepository);
  }

  async createSession(
    userId,
    deviceInfo = {},
    ipAddress = null,
    userAgent = null,
    clientFingerprint = {}
  ) {
    try {
      // Generate comprehensive device fingerprint
      const requestData = {
        ip: ipAddress,
        userAgent: userAgent,
        headers: deviceInfo.headers || {},
      };

      const fingerprint = this.deviceFingerprintService.generateFingerprint(
        requestData,
        clientFingerprint
      );

      // Generate session token
      const sessionToken = this.authService.generateAccessToken({
        userId,
        type: "session",
      });

      // Generate refresh token
      const refreshToken = this.authService.generateRefreshToken({
        userId,
        type: "refresh",
      });

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() + config.jwt.sessionExpiresIn
      );

      // Create session record with enhanced device info
      const session = await this.sessionRepository.create({
        userId,
        sessionToken,
        refreshToken,
        deviceInfo: fingerprint,
        ipAddress,
        userAgent,
        expiresAt,
        lastActivityAt: new Date(),
      });

      // Log login activity with fingerprint
      await this.userActivityRepository.logLogin(
        userId,
        session.id,
        ipAddress,
        userAgent,
        fingerprint
      );

      return {
        sessionId: session.id,
        sessionToken,
        refreshToken,
        expiresAt: session.expiresAt,
        deviceInfo: fingerprint,
      };
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async validateSession(sessionToken) {
    try {
      const session = await this.sessionRepository.findByToken(sessionToken);

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.isExpired()) {
        await this.sessionRepository.deactivate(session.id);
        return null;
      }

      // Update last activity
      await this.sessionRepository.updateActivity(session.id);

      return session;
    } catch (error) {
      throw new Error(`Failed to validate session: ${error.message}`);
    }
  }

  async refreshSession(refreshToken, ipAddress = null, userAgent = null) {
    try {
      const session = await this.sessionRepository.findByRefreshToken(
        refreshToken
      );

      if (!session) {
        throw new Error("Invalid refresh token");
      }

      // Check if session is expired
      if (session.isExpired()) {
        await this.sessionRepository.deactivate(session.id);
        throw new Error("Session expired");
      }

      // Generate new tokens
      const newSessionToken = this.authService.generateToken(
        { userId: session.userId, type: "session" },
        config.jwt.sessionExpiresIn
      );

      const newRefreshToken = this.authService.generateToken(
        { userId: session.userId, type: "refresh" },
        config.jwt.refreshExpiresIn
      );

      // Calculate new expiration time
      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() + config.jwt.sessionExpiresIn
      );

      // Update session
      await this.sessionRepository.update(session.id, {
        sessionToken: newSessionToken,
        refreshToken: newRefreshToken,
        expiresAt,
        lastActivityAt: new Date(),
      });

      return {
        sessionId: session.id,
        sessionToken: newSessionToken,
        refreshToken: newRefreshToken,
        expiresAt,
      };
    } catch (error) {
      throw new Error(`Failed to refresh session: ${error.message}`);
    }
  }

  async terminateSession(
    sessionId,
    userId,
    ipAddress = null,
    userAgent = null
  ) {
    try {
      const session = await this.sessionRepository.findById(sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if user owns this session
      if (session.userId !== userId) {
        throw new Error("Unauthorized to terminate this session");
      }

      // Deactivate session
      await this.sessionRepository.deactivate(sessionId);

      // Log session termination
      await this.userActivityRepository.logSessionTerminated(
        userId,
        sessionId,
        ipAddress,
        userAgent
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to terminate session: ${error.message}`);
    }
  }

  async terminateAllSessions(
    userId,
    excludeSessionId = null,
    ipAddress = null,
    userAgent = null
  ) {
    try {
      const sessions = await this.sessionRepository.findActiveByUserId(userId);

      for (const session of sessions) {
        if (excludeSessionId && session.id === excludeSessionId) {
          continue;
        }

        await this.sessionRepository.deactivate(session.id);

        // Log session termination
        await this.userActivityRepository.logSessionTerminated(
          userId,
          session.id,
          ipAddress,
          userAgent
        );
      }

      return sessions.length;
    } catch (error) {
      throw new Error(`Failed to terminate all sessions: ${error.message}`);
    }
  }

  async getUserSessions(userId, options = {}) {
    try {
      return await this.sessionRepository.findAll({
        userId,
        ...options,
      });
    } catch (error) {
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }

  async getSessionStats(userId = null) {
    try {
      return await this.sessionRepository.getSessionStats(userId);
    } catch (error) {
      throw new Error(`Failed to get session stats: ${error.message}`);
    }
  }

  async cleanupExpiredSessions() {
    try {
      return await this.sessionRepository.cleanupExpired();
    } catch (error) {
      throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
    }
  }

  async getDeviceInfo(userAgent) {
    try {
      const requestData = {
        userAgent: userAgent,
        headers: {},
      };

      return this.deviceFingerprintService.generateFingerprint(requestData);
    } catch (error) {
      return this.deviceFingerprintService.getFallbackFingerprint({
        userAgent,
      });
    }
  }

  /**
   * Detect suspicious login patterns
   */
  async detectSuspiciousLogin(userId, currentFingerprint) {
    try {
      // Get previous login fingerprints for this user
      const previousSessions = await this.sessionRepository.findRecentByUserId(
        userId,
        5
      );
      const previousFingerprints = previousSessions
        .map((session) => session.deviceInfo)
        .filter((fingerprint) => fingerprint && fingerprint.metadata);

      return this.deviceFingerprintService.detectSuspiciousLogin(
        currentFingerprint,
        previousFingerprints
      );
    } catch (error) {
      console.error("Error detecting suspicious login:", error);
      return {
        isSuspicious: false,
        flags: [],
        riskLevel: "none",
      };
    }
  }
}

module.exports = SessionService;
