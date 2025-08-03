const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middlewares/auth");
const { validateRequest } = require("../middlewares/validation");
const UserIdentityTrackingService = require("../../application/services/UserIdentityTrackingService");

const identityTrackingService = new UserIdentityTrackingService();

/**
 * @swagger
 * /api/v1/identities:
 *   get:
 *     summary: Get user identities
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by risk level
 *     responses:
 *       200:
 *         description: List of user identities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserIdentity'
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, riskLevel } = req.query;
    const options = { page: parseInt(page), limit: parseInt(limit) };

    if (riskLevel) {
      options.riskLevel = riskLevel;
    }

    const result = await identityTrackingService.identityRepository.findAll(
      options
    );

    res.json({
      success: true,
      message: "User identities retrieved successfully",
      data: result.identities,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/identities/my:
 *   get:
 *     summary: Get current user's identities
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's identities
 */
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const result =
      await identityTrackingService.identityRepository.findByUserId(
        req.user.id
      );

    res.json({
      success: true,
      message: "User identities retrieved successfully",
      data: result.rows,
      pagination: {
        page: 1,
        limit: result.count,
        total: result.count,
        totalPages: 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/identities/analysis:
 *   get:
 *     summary: Get user identity analysis
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User identity analysis
 */
router.get("/analysis", authenticate, async (req, res, next) => {
  try {
    console.log("🔍 Analysis route - req.user:", req.user);
    console.log("🔍 Analysis route - req.user.id:", req.user.id);

    const analysis = await identityTrackingService.getUserIdentityAnalysis(
      req.user.id
    );

    res.json({
      success: true,
      message: "User identity analysis retrieved successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("❌ Analysis route error:", error.message);
    console.error("❌ Analysis route stack:", error.stack);
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/identities/suspicious:
 *   get:
 *     summary: Get suspicious activity report
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to analyze
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [medium, high, critical, all]
 *           default: high
 *         description: Minimum risk level to include
 *     responses:
 *       200:
 *         description: Suspicious activity report
 */
router.get(
  "/suspicious",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { days = 7, riskLevel = "high" } = req.query;
      const options = { days: parseInt(days), riskLevel };

      const report = await identityTrackingService.getSuspiciousActivityReport(
        options
      );

      res.json({
        success: true,
        message: "Suspicious activity report retrieved successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/{id}:
 *   get:
 *     summary: Get specific user identity
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identity ID
 *     responses:
 *       200:
 *         description: User identity details
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const identity = await identityTrackingService.identityRepository.findById(
      req.params.id
    );

    if (!identity) {
      return res.status(404).json({
        success: false,
        message: "User identity not found",
      });
    }

    res.json({
      success: true,
      message: "User identity retrieved successfully",
      data: identity,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/identities/{id}/verify:
 *   post:
 *     summary: Verify user identity
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, sms, 2fa, biometric, manual]
 *                 default: manual
 *     responses:
 *       200:
 *         description: Identity verified successfully
 */
router.post(
  "/:id/verify",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { method = "manual" } = req.body;

      const result = await identityTrackingService.verifyIdentity(
        req.params.id,
        method
      );

      res.json({
        success: true,
        message: "User identity verified successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/{id}/block:
 *   post:
 *     summary: Block user identity
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 required: true
 *                 description: Reason for blocking
 *     responses:
 *       200:
 *         description: Identity blocked successfully
 */
router.post(
  "/:id/block",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Block reason is required",
        });
      }

      const result = await identityTrackingService.blockIdentity(
        req.params.id,
        reason
      );

      res.json({
        success: true,
        message: "User identity blocked successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/{id}/unblock:
 *   post:
 *     summary: Unblock user identity
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identity ID
 *     responses:
 *       200:
 *         description: Identity unblocked successfully
 */
router.post(
  "/:id/unblock",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const result = await identityTrackingService.unblockIdentity(
        req.params.id
      );

      res.json({
        success: true,
        message: "User identity unblocked successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/compare:
 *   post:
 *     summary: Compare two user identities
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identityId1:
 *                 type: string
 *                 required: true
 *               identityId2:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Identity comparison result
 */
router.post(
  "/compare",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { identityId1, identityId2 } = req.body;

      if (!identityId1 || !identityId2) {
        return res.status(400).json({
          success: false,
          message: "Both identity IDs are required",
        });
      }

      const result = await identityTrackingService.compareIdentities(
        identityId1,
        identityId2
      );

      res.json({
        success: true,
        message: "Identity comparison completed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/stats:
 *   get:
 *     summary: Get identity statistics
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Identity statistics
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const stats =
        await identityTrackingService.identityRepository.getIdentityStats();

      res.json({
        success: true,
        message: "Identity statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/identities/cleanup:
 *   post:
 *     summary: Cleanup old identities
 *     tags: [Identities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysInactive:
 *                 type: integer
 *                 default: 30
 *                 description: Days of inactivity before cleanup
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
router.post(
  "/cleanup",
  authenticate,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { daysInactive = 30 } = req.body;

      const result = await identityTrackingService.cleanupOldIdentities(
        daysInactive
      );

      res.json({
        success: true,
        message: "Identity cleanup completed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
