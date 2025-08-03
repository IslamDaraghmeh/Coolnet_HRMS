const express = require("express");
const router = express.Router();
const SessionService = require("../../application/services/SessionService");
const sessionMiddleware = require("../middlewares/session");
const { authenticate, requirePermission } = require("../middlewares/auth");
const { ValidationError, AuthenticationError } = require("../../domain/errors");

const sessionService = new SessionService();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: User session management endpoints
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get user sessions
 *     tags: [Sessions]
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
 *         description: Number of records per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Session'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticate,
  requirePermission("sessions:read"),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, isActive } = req.query;
      const userId = req.user.id;

      const result = await sessionService.getUserSessions(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
      });

      res.json({
        success: true,
        message: "Sessions retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sessions/stats:
 *   get:
 *     summary: Get session statistics
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/stats", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await sessionService.getSessionStats(userId);

    res.json({
      success: true,
      message: "Session statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /sessions/{sessionId}:
 *   delete:
 *     summary: Terminate a specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID to terminate
 *     responses:
 *       200:
 *         description: Session terminated successfully
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
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:sessionId",
  authenticate,
  requirePermission("sessions:delete"),
  async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      await sessionService.terminateSession(
        sessionId,
        userId,
        req.clientInfo?.ipAddress,
        req.clientInfo?.userAgent
      );

      res.json({
        success: true,
        message: "Session terminated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sessions/terminate-all:
 *   post:
 *     summary: Terminate all user sessions except current
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     terminatedCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/terminate-all", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.sessionId;

    const terminatedCount = await sessionService.terminateAllSessions(
      userId,
      currentSessionId,
      req.clientInfo?.ipAddress,
      req.clientInfo?.userAgent
    );

    res.json({
      success: true,
      message: "All sessions terminated successfully",
      data: {
        terminatedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /sessions/refresh:
 *   post:
 *     summary: Refresh session token
 *     tags: [Sessions]
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
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Session refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid refresh token
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError("Refresh token is required");
    }

    const result = await sessionService.refreshSession(
      refreshToken,
      req.clientInfo?.ipAddress,
      req.clientInfo?.userAgent
    );

    res.json({
      success: true,
      message: "Session refreshed successfully",
      data: {
        sessionToken: result.sessionToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
