const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { validateRequest } = require("../middlewares/validation");
const authValidators = require("../validators/auth");
const SessionService = require("../../application/services/SessionService");
const sessionMiddleware = require("../middlewares/session");

const sessionService = new SessionService();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *           example: "0566008007"
 *         password:
 *           type: string
 *           description: User's password
 *           example: "password123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 expiresIn:
 *                   type: string
 *                   description: Token expiration time
 *     OTPRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *           example: "0566008007"
 *     OTPLoginRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - otp
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *           example: "0566008007"
 *         otp:
 *           type: string
 *           description: One-time password
 *           example: "123456"
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with phone number and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  validateRequest(authValidators.loginSchema),
  sessionMiddleware.getClientInfo,
  async (req, res, next) => {
    try {
      const LoginUseCase = require("../../application/use-cases/auth/LoginUseCase");
      const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

      const userRepository = new UserRepository();
      const loginUseCase = new LoginUseCase(userRepository, null); // Pass null for notificationService for now

      // Extract client fingerprint from request body if available
      const clientFingerprint = req.body.fingerprint || {};

      const deviceInfo = {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        timestamp: new Date().toISOString(),
        headers: req.headers,
      };

      console.log("Login attempt:", req.body); // Debug log
      console.log("Client fingerprint:", clientFingerprint); // Debug log

      const result = await loginUseCase.executeWithPassword(
        req.body,
        deviceInfo
      );

      console.log("Login successful:", result.user.id); // Debug log

      // Create session with enhanced fingerprinting
      const session = await sessionService.createSession(
        result.user.id,
        req.clientInfo?.deviceInfo || {},
        req.clientInfo?.ipAddress,
        req.clientInfo?.userAgent,
        clientFingerprint
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          tokens: {
            sessionToken: session.sessionToken,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
          },
          session: {
            id: session.sessionId,
            deviceInfo: session.deviceInfo,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error.message); // Debug log

      // Provide user-friendly error messages
      if (error.name === "AuthenticationError") {
        return res.status(401).json({
          success: false,
          message:
            "Invalid phone number or password. Please check your credentials and try again.",
          error: "AUTHENTICATION_FAILED",
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
      console.error("Error Log:", {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          statusCode: error.statusCode || 500,
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
        message: "An unexpected error occurred. Please try again later.",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);

/**
 * @swagger
 * /auth/login/otp:
 *   post:
 *     summary: Login with phone number and OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login/otp",
  validateRequest(authValidators.otpLoginSchema),
  async (req, res, next) => {
    try {
      const LoginUseCase = require("../../application/use-cases/auth/LoginUseCase");
      const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

      const userRepository = new UserRepository();
      const loginUseCase = new LoginUseCase(userRepository, null); // Pass null for notificationService for now

      const deviceInfo = {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        timestamp: new Date().toISOString(),
      };

      const result = await loginUseCase.executeWithOTP(req.body, deviceInfo);

      res.json({
        success: true,
        message: "OTP login successful",
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/otp/request:
 *   post:
 *     summary: Request OTP for login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     phoneNumber:
 *                       type: string
 *                       description: Masked phone number
 *                       example: "*******890"
 *       400:
 *         description: Invalid phone number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/otp/request",
  validateRequest(authValidators.otpRequestSchema),
  async (req, res, next) => {
    try {
      const LoginUseCase = require("../../application/use-cases/auth/LoginUseCase");
      const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

      const userRepository = new UserRepository();
      const loginUseCase = new LoginUseCase(userRepository, null);

      const { phoneNumber } = req.body;

      // Check if user exists
      const user = await userRepository.findByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Phone number not registered",
        });
      }

      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Generate and send OTP
      const otp = loginUseCase.generateOTP();
      await loginUseCase.sendOTP(phoneNumber, otp);
      await loginUseCase.storeOTP(phoneNumber, otp);

      res.json({
        success: true,
        message: "OTP sent successfully",
        data: {
          phoneNumber: req.body.phoneNumber.replace(/\d(?=\d{4})/g, "*"),
        },
      });
    } catch (error) {
      console.error("OTP request error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: "VALIDATION_ERROR",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     expiresIn:
 *                       type: string
 *                       description: Token expiration time
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/refresh",
  validateRequest(authValidators.refreshTokenSchema),
  async (req, res, next) => {
    try {
      const RefreshTokenUseCase = require("../../application/use-cases/auth/RefreshTokenUseCase");
      const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

      const userRepository = new UserRepository();
      const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);

      const result = await refreshTokenUseCase.execute(req.body.refreshToken);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", authenticate, async (req, res, next) => {
  try {
    const LogoutUseCase = require("../../application/use-cases/auth/LogoutUseCase");
    const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

    const userRepository = new UserRepository();
    const logoutUseCase = new LogoutUseCase(userRepository);

    await logoutUseCase.execute(req.user.id);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and terminate session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/logout",
  authenticate,
  sessionMiddleware.getClientInfo,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const sessionId = req.sessionId;

      if (sessionId) {
        await sessionService.terminateSession(
          sessionId,
          userId,
          req.clientInfo?.ipAddress,
          req.clientInfo?.userAgent
        );
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile with role and all employees data
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of employees per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for employee name, email, or ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, terminated]
 *         description: Filter by employment status
 *     responses:
 *       200:
 *         description: User profile and employees data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User profile and employees data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-uuid"
 *                         phoneNumber:
 *                           type: string
 *                           example: "0566008007"
 *                         email:
 *                           type: string
 *                           example: "user@company.com"
 *                         role:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "role-uuid"
 *                             name:
 *                               type: string
 *                               example: "admin"
 *                             description:
 *                               type: string
 *                               example: "System Administrator"
 *                             permissions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["users:read", "users:create"]
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");
    const UserRepository = require("../../infrastructure/db/repositories/UserRepository");
    const { sequelize } = require("../../infrastructure/db/connection");

    const employeeRepository = new EmployeeRepository();
    const userRepository = new UserRepository();

    // Get current user basic info
    const currentUser = await userRepository.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user role information
    let userRole = null;
    try {
      const roleResult = await sequelize.query(
        `SELECT r.id, r.name, r.description, r.permissions
         FROM "Roles" r
         INNER JOIN "UserRoles" ur ON r.id = ur."roleId"
         WHERE ur."userId" = :userId AND ur."isActive" = true AND r."isActive" = true
         LIMIT 1`,
        {
          replacements: { userId: req.user.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (roleResult.length > 0) {
        const role = roleResult[0];
        userRole = {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions
            ? typeof role.permissions === "string"
              ? JSON.parse(role.permissions)
              : role.permissions
            : [],
        };
      }
    } catch (roleError) {
      console.error("Error fetching user role:", roleError);
      // Continue without role if there's an error
    }

    // Extract query parameters for filtering and pagination
    const {
      page = 1,
      limit = 10,
      search,
      department,
      position,
      status,
      employmentType,
      managerId,
    } = req.query;

    // Build options object for repository
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      department,
      position,
      status,
      employmentType,
      managerId,
    };

    // Get all employees with filters and pagination
    const employeesResult = await employeeRepository.findAll({}, options);

    // Format current user data with role
    const currentUserData = {
      id: currentUser.id,
      phoneNumber: currentUser.phoneNumber,
      email: currentUser.email,
      isActive: currentUser.isActive,
      lastLoginAt: currentUser.lastLoginAt,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
      role: userRole,
    };

    res.json({
      success: true,
      message: "User profile and employees data retrieved successfully",
      data: {
        currentUser: currentUserData,
        ...employeesResult,
      },
    });
  } catch (error) {
    console.error("Error in /me endpoint:", error);

    // Provide user-friendly error response
    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve user profile and employees data. Please try again later.",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/change-password",
  authenticate,
  validateRequest(authValidators.changePasswordSchema),
  async (req, res, next) => {
    try {
      const UserRepository = require("../../infrastructure/db/repositories/UserRepository");
      const bcrypt = require("bcryptjs");
      const config = require("../../config");

      const userRepository = new UserRepository();
      const { currentPassword, newPassword } = req.body;

      // Get current user
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        config.security.bcryptRounds
      );

      // Update password
      await userRepository.update(user.id, {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: "VALIDATION_ERROR",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to change password. Please try again later.",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  }
);

module.exports = router;
