const express = require("express");
const router = express.Router();
const UserActivityRepository = require("../../infrastructure/db/repositories/UserActivityRepository");
const { authenticate, requirePermission } = require("../middlewares/auth");

const userActivityRepository = new UserActivityRepository();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: User activity tracking endpoints
 */

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get user activities
 *     tags: [Activities]
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
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: activityCategory
 *         schema:
 *           type: string
 *         description: Filter by activity category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failure, pending]
 *         description: Filter by status
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *         description: Filter by resource ID
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
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
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserActivity'
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
  requirePermission("activities:read"),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 50,
        activityType,
        activityCategory,
        status,
        resourceType,
        resourceId,
      } = req.query;

      const result = await userActivityRepository.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        activityType,
        activityCategory,
        status,
        resourceType,
        resourceId,
      });

      res.json({
        success: true,
        message: "Activities retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /activities/my:
 *   get:
 *     summary: Get current user's activities
 *     tags: [Activities]
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
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: activityCategory
 *         schema:
 *           type: string
 *         description: Filter by activity category
 *     responses:
 *       200:
 *         description: User activities retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserActivity'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, activityType, activityCategory } = req.query;
    const userId = req.user.id;

    const activities = await userActivityRepository.findByUserId(userId, {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      activityType,
      activityCategory,
    });

    res.json({
      success: true,
      message: "User activities retrieved successfully",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /activities/recent:
 *   get:
 *     summary: Get recent user activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserActivity'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/recent", authenticate, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user.id;

    const activities = await userActivityRepository.findRecentByUserId(
      userId,
      parseInt(days)
    );

    res.json({
      success: true,
      message: "Recent activities retrieved successfully",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /activities/stats:
 *   get:
 *     summary: Get user activity statistics
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Activity statistics retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       activityType:
 *                         type: string
 *                       activityCategory:
 *                         type: string
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/stats", authenticate, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    const stats = await userActivityRepository.getActivityStats(
      userId,
      parseInt(days)
    );

    res.json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get specific activity by ID
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity retrieved successfully
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
 *                   $ref: '#/components/schemas/UserActivity'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("activities:read"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const activity = await userActivityRepository.findById(id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: "Activity not found",
          error: "NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Activity retrieved successfully",
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
