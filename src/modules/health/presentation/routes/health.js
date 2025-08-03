const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
router.get("/", (req, res) => {
  const healthData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  res.status(200).json(healthData);
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check endpoint
 *     description: Returns detailed health information including database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     responseTime:
 *                       type: number
 *                       example: 15
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                       example: 52428800
 *                     total:
 *                       type: number
 *                       example: 1073741824
 *                     percentage:
 *                       type: number
 *                       example: 4.88
 */
router.get("/detailed", async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    let dbStatus = "disconnected";
    let dbResponseTime = 0;

    try {
      const { sequelize } = require("../../infrastructure/db/connection");
      await sequelize.authenticate();
      dbResponseTime = Date.now() - startTime;
      dbStatus = "connected";
    } catch (error) {
      dbStatus = "error";
      dbResponseTime = Date.now() - startTime;
    }

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryData = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2),
    };

    const healthData = {
      status: dbStatus === "connected" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      memory: memoryData,
    };

    const statusCode = dbStatus === "connected" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

module.exports = router;
