const {
  AuthenticationError,
  AuthorizationError,
} = require("../../domain/errors");
const AuthService = require("../../application/services/AuthService");
const UserRepository = require("../../infrastructure/db/repositories/UserRepository");
const SessionService = require("../../application/services/SessionService");

// Initialize services
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const sessionService = new SessionService();

/**
 * Authentication Middleware
 * Verifies session token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header is required. Please provide a valid session token.",
        error: "MISSING_AUTHORIZATION_HEADER",
      });
    }

    // Extract session token
    const sessionToken = authHeader.replace("Bearer ", "");

    // Validate session
    const session = await sessionService.validateSession(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session token. Please login again.",
        error: "INVALID_SESSION",
      });
    }

    // Get user information
    const user = await userRepository.findById(session.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
        error: "USER_NOT_FOUND",
      });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.sessionId = session.id;

    next();
  } catch (error) {
    // Provide user-friendly error messages
    if (error.name === "AuthenticationError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session token. Please login again.",
        error: "INVALID_TOKEN",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: "VALIDATION_ERROR",
      });
    }

    // Log detailed error for debugging
    console.error("Authentication error:", {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Authentication service error. Please try again later.",
      error: "AUTHENTICATION_SERVICE_ERROR",
    });
  }
};

/**
 * Optional Authentication Middleware
 * Verifies JWT token if present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const user = await authService.validateTokenAndGetUser(authHeader);
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      // Get user roles (implement based on your role system)
      const userRoles = await getUserRoles(req.user.id);

      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        throw new AuthorizationError("Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Permission-based Authorization Middleware
 * Checks if user has required permission
 */
const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      console.log("🔍 requirePermission middleware called");
      console.log("🔍 Required permissions:", permissions);
      console.log("🔍 User ID:", req.user?.id);

      if (!req.user) {
        console.log("❌ No user found");
        throw new AuthenticationError("Authentication required");
      }

      // Get user permissions (implement based on your permission system)
      const userPermissions = await getUserPermissions(req.user.id);
      console.log("🔍 User permissions:", userPermissions);

      const hasRequiredPermission = permissions.some((requiredPermission) => {
        console.log("🔍 Checking permission:", requiredPermission);

        // Check for exact match first
        if (userPermissions.includes(requiredPermission)) {
          console.log("✅ Exact match found for:", requiredPermission);
          return true;
        }

        // Check for wildcard permissions
        const [resource, action] = requiredPermission.split(":");
        const wildcardPermission = `*:${action}`;
        console.log("🔍 Checking wildcard permission:", wildcardPermission);

        if (userPermissions.includes(wildcardPermission)) {
          console.log("✅ Wildcard match found for:", wildcardPermission);
          return true;
        }

        // Check for system admin permission
        if (userPermissions.includes("system:admin")) {
          console.log("✅ System admin permission found");
          return true;
        }

        console.log("❌ No permission match found for:", requiredPermission);
        return false;
      });
      console.log("🔍 Has required permission:", hasRequiredPermission);

      if (!hasRequiredPermission) {
        console.log("❌ Insufficient permissions");
        throw new AuthorizationError("Insufficient permissions");
      }

      console.log("✅ Permission check passed");
      next();
    } catch (error) {
      console.log("❌ Error in requirePermission:", error.message);
      next(error);
    }
  };
};

/**
 * Self or Admin Authorization Middleware
 * Allows users to access their own resources or admins to access any
 */
const selfOrAdmin = (resourceUserIdField = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const resourceUserId =
        req.params[resourceUserIdField] || req.body[resourceUserIdField];

      // Allow if user is accessing their own resource
      if (resourceUserId === req.user.id) {
        return next();
      }

      // Check if user is admin
      const userRoles = await getUserRoles(req.user.id);
      if (userRoles.includes("admin")) {
        return next();
      }

      throw new AuthorizationError("Access denied");
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Manager Authorization Middleware
 * Allows managers to access their subordinates' resources
 */
const managerOrSelf = (employeeIdField = "employeeId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const targetEmployeeId =
        req.params[employeeIdField] || req.body[employeeIdField];

      // Allow if user is accessing their own resource
      if (targetEmployeeId === req.user.employeeId) {
        return next();
      }

      // Check if user is manager of the target employee
      const isManager = await checkIfManager(
        req.user.employeeId,
        targetEmployeeId
      );
      if (isManager) {
        return next();
      }

      // Check if user is admin
      const userRoles = await getUserRoles(req.user.id);
      if (userRoles.includes("admin")) {
        return next();
      }

      throw new AuthorizationError("Access denied");
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Get user roles (placeholder - implement based on your role system)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of role names
 */
async function getUserRoles(userId) {
  try {
    const { sequelize } = require("../../infrastructure/db/connection");

    const roles = await sequelize.query(
      `SELECT r.name
       FROM "Roles" r
       INNER JOIN "UserRoles" ur ON r.id = ur."roleId"
       WHERE ur."userId" = :userId AND ur."isActive" = true AND r."isActive" = true`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return roles.map((role) => role.name);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return ["user"]; // Default fallback
  }
}

/**
 * Get user permissions (placeholder - implement based on your permission system)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of permission names
 */
async function getUserPermissions(userId) {
  try {
    console.log("🔍 getUserPermissions called with userId:", userId);
    const { sequelize } = require("../../infrastructure/db/connection");

    const permissions = await sequelize.query(
      `SELECT DISTINCT jsonb_array_elements_text(r.permissions) as permission
       FROM "Roles" r
       INNER JOIN "UserRoles" ur ON r.id = ur."roleId"
       WHERE ur."userId" = :userId AND ur."isActive" = true AND r."isActive" = true`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("🔍 Raw permissions from DB:", permissions);
    const permissionNames = permissions.map((p) => p.permission);
    console.log("🔍 Permission names:", permissionNames);
    return permissionNames;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return ["read:own"]; // Default fallback
  }
}

/**
 * Check if user is manager of target employee (placeholder)
 * @param {string} managerId - Manager employee ID
 * @param {string} employeeId - Employee ID
 * @returns {Promise<boolean>} True if manager
 */
async function checkIfManager(managerId, employeeId) {
  try {
    const { sequelize } = require("../../infrastructure/db/connection");

    const result = await sequelize.query(
      `SELECT COUNT(*) as count
       FROM "employees" e
       WHERE e.id = :employeeId AND e."managerId" = :managerId AND e.status = 'active'`,
      {
        replacements: { employeeId, managerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return result[0].count > 0;
  } catch (error) {
    console.error("Error checking manager relationship:", error);
    return false; // Default fallback
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  selfOrAdmin,
  managerOrSelf,
};
