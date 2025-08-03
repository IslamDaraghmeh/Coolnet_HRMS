const SessionService = require("../../application/services/SessionService");
const { AuthenticationError } = require("../../domain/errors");

class SessionMiddleware {
  constructor() {
    this.sessionService = new SessionService();
  }

  // Middleware to authenticate session token
  authenticateSession = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("Session token required");
      }

      const sessionToken = authHeader.substring(7);
      const session = await this.sessionService.validateSession(sessionToken);

      if (!session) {
        throw new AuthenticationError("Invalid or expired session token");
      }

      // Add session info to request
      req.session = session;
      req.userId = session.userId;
      req.sessionId = session.id;

      next();
    } catch (error) {
      next(error);
    }
  };

  // Middleware to get client information
  getClientInfo = (req, res, next) => {
    try {
      const ipAddress =
        req.ip ||
        req.connection.remoteAddress ||
        req.headers["x-forwarded-for"];
      const userAgent = req.headers["user-agent"];

      req.clientInfo = {
        ipAddress,
        userAgent,
        deviceInfo: this.sessionService.getDeviceInfo(userAgent),
      };

      next();
    } catch (error) {
      next(error);
    }
  };

  // Middleware to update session activity
  updateSessionActivity = async (req, res, next) => {
    try {
      if (req.sessionId) {
        await this.sessionService.sessionRepository.updateActivity(
          req.sessionId
        );
      }
      next();
    } catch (error) {
      // Don't fail the request if session update fails
      next();
    }
  };

  // Middleware to check session permissions
  requireActiveSession = async (req, res, next) => {
    try {
      if (!req.session) {
        throw new AuthenticationError("Active session required");
      }

      if (!req.session.isSessionActive()) {
        throw new AuthenticationError("Session is not active");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  // Middleware to limit concurrent sessions
  limitConcurrentSessions = (maxSessions = 5) => {
    return async (req, res, next) => {
      try {
        if (!req.userId) {
          return next();
        }

        const activeSessions =
          await this.sessionService.sessionRepository.findActiveByUserId(
            req.userId
          );

        if (activeSessions.length >= maxSessions) {
          // Terminate oldest session
          const oldestSession = activeSessions[activeSessions.length - 1];
          await this.sessionService.sessionRepository.deactivate(
            oldestSession.id
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  // Middleware to log session activity
  logSessionActivity = (activityType, activityCategory, description) => {
    return async (req, res, next) => {
      try {
        if (req.userId && req.sessionId) {
          await this.sessionService.userActivityRepository.logActivity({
            userId: req.userId,
            sessionId: req.sessionId,
            activityType,
            activityCategory,
            description,
            ipAddress: req.clientInfo?.ipAddress,
            userAgent: req.clientInfo?.userAgent,
          });
        }
        next();
      } catch (error) {
        // Don't fail the request if logging fails
        next();
      }
    };
  };
}

module.exports = new SessionMiddleware();
