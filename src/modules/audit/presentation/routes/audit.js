const express = require("express");
const router = express.Router();
const AuditLogRepository = require("../../infrastructure/db/repositories/AuditLogRepository");
const { authenticate, requirePermission } = require("../middlewares/auth");

const auditLogRepository = new AuditLogRepository();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: System audit log endpoints
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
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
 *           default: 100
 *         description: Number of records per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, READ, UPDATE, DELETE]
 *         description: Filter by action
 *       - in: query
 *         name: tableName
 *         schema:
 *           type: string
 *         description: Filter by table name
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *         description: Filter by HTTP status code
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: string
 *         description: Filter by request ID
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
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
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
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
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 100,
        action,
        tableName,
        userId,
        statusCode,
        requestId,
      } = req.query;

      const result = await auditLogRepository.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        tableName,
        userId,
        statusCode: statusCode ? parseInt(statusCode) : undefined,
        requestId,
      });

      res.json({
        success: true,
        message: "Audit logs retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/recent:
 *   get:
 *     summary: Get recent audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to look back
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: tableName
 *         schema:
 *           type: string
 *         description: Filter by table name
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Recent audit logs retrieved successfully
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
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/recent",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { days = 7, limit = 100, action, tableName, userId } = req.query;

      const auditLogs = await auditLogRepository.findRecent(parseInt(days), {
        limit: parseInt(limit),
        action,
        tableName,
        userId,
      });

      res.json({
        success: true,
        message: "Recent audit logs retrieved successfully",
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/stats:
 *   get:
 *     summary: Get audit log statistics
 *     tags: [Audit]
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
 *         description: Audit statistics retrieved successfully
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
 *                       action:
 *                         type: string
 *                       tableName:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/stats",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { days = 30 } = req.query;

      const stats = await auditLogRepository.getAuditStats(parseInt(days));

      res.json({
        success: true,
        message: "Audit statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/table/{tableName}:
 *   get:
 *     summary: Get audit logs for specific table
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: Table name
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
 *           default: 100
 *         description: Number of records per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: recordId
 *         schema:
 *           type: string
 *         description: Filter by record ID
 *     responses:
 *       200:
 *         description: Table audit logs retrieved successfully
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
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/table/:tableName",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { tableName } = req.params;
      const { page = 1, limit = 100, action, recordId } = req.query;

      const auditLogs = await auditLogRepository.findByTable(tableName, {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        action,
        recordId,
      });

      res.json({
        success: true,
        message: "Table audit logs retrieved successfully",
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/record/{tableName}/{recordId}:
 *   get:
 *     summary: Get audit logs for specific record
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *         description: Table name
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
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
 *     responses:
 *       200:
 *         description: Record audit logs retrieved successfully
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
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/record/:tableName/:recordId",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { tableName, recordId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const auditLogs = await auditLogRepository.findByRecord(
        tableName,
        recordId,
        {
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
        }
      );

      res.json({
        success: true,
        message: "Record audit logs retrieved successfully",
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/request/{requestId}:
 *   get:
 *     summary: Get audit logs for specific request
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request audit logs retrieved successfully
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
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/request/:requestId",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { requestId } = req.params;

      const auditLogs = await auditLogRepository.findByRequestId(requestId);

      res.json({
        success: true,
        message: "Request audit logs retrieved successfully",
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /audit/{id}:
 *   get:
 *     summary: Get specific audit log by ID
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
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
 *                   $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("audit:read"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const auditLog = await auditLogRepository.findById(id);

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: "Audit log not found",
          error: "NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Audit log retrieved successfully",
        data: auditLog,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
