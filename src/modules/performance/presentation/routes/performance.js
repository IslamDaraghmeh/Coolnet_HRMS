const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const PerformanceRepository = require("../../infrastructure/db/repositories/PerformanceRepository");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Performance
 *   description: Performance review endpoints
 */

router.get("/", authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Performance endpoint - implementation pending",
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /performance:
 *   post:
 *     summary: Create performance review
 *     description: Create a new performance review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerformanceReviewRequest'
 *     responses:
 *       201:
 *         description: Performance review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  requirePermission(["performance:create"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const employeeRepository = new EmployeeRepository();

      // Validate employee exists
      const employee = await employeeRepository.findById(req.body.employeeId);
      if (!employee) {
        return res.status(400).json({
          success: false,
          message: "Employee not found",
        });
      }

      if (!employee.isActive) {
        return res.status(400).json({
          success: false,
          message: "Employee is not active",
        });
      }

      // Validate reviewer exists
      const reviewer = await employeeRepository.findById(req.body.reviewerId);
      if (!reviewer) {
        return res.status(400).json({
          success: false,
          message: "Reviewer not found",
        });
      }

      const review = await performanceRepository.create({
        ...req.body,
        status: "draft",
      });

      res.status(201).json({
        success: true,
        message: "Performance review created successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance:
 *   get:
 *     summary: Get performance reviews
 *     description: Retrieve performance reviews with optional filters
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: reviewerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by reviewer ID
 *       - in: query
 *         name: reviewPeriod
 *         schema:
 *           type: string
 *         description: Filter by review period
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, completed, approved]
 *         description: Filter by status
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum overall rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Maximum overall rating
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Performance reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const filters = {};
      const options = req.query;

      if (req.query.employeeId) filters.employeeId = req.query.employeeId;
      if (req.query.reviewerId) filters.reviewerId = req.query.reviewerId;
      if (req.query.reviewPeriod) filters.reviewPeriod = req.query.reviewPeriod;
      if (req.query.status) filters.status = req.query.status;

      const result = await performanceRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Performance reviews retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/{id}:
 *   get:
 *     summary: Get performance review by ID
 *     description: Retrieve a specific performance review by ID
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review ID
 *     responses:
 *       200:
 *         description: Performance review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewResponse'
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const review = await performanceRepository.findByIdWithDetails(
        req.params.id
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Performance review not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Performance review retrieved successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/{id}:
 *   put:
 *     summary: Update performance review
 *     description: Update an existing performance review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePerformanceReviewRequest'
 *     responses:
 *       200:
 *         description: Performance review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewResponse'
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["performance:update"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const review = await performanceRepository.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Performance review not found",
        });
      }

      // Only allow updates if review is draft or in progress
      if (!["draft", "in_progress"].includes(review.status)) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot update performance review that is not in draft or in progress status",
        });
      }

      const updatedReview = await performanceRepository.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Performance review updated successfully",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/{id}/submit:
 *   post:
 *     summary: Submit performance review
 *     description: Submit a draft performance review for approval
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review ID
 *     responses:
 *       200:
 *         description: Performance review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewResponse'
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/submit",
  authenticate,
  requirePermission(["performance:update"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const review = await performanceRepository.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Performance review not found",
        });
      }

      if (review.status !== "draft") {
        return res.status(400).json({
          success: false,
          message: "Performance review is not in draft status",
        });
      }

      const updatedReview = await performanceRepository.update(req.params.id, {
        status: "in_progress",
        submittedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Performance review submitted successfully",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/{id}/approve:
 *   post:
 *     summary: Approve performance review
 *     description: Approve a completed performance review
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review ID
 *     responses:
 *       200:
 *         description: Performance review approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceReviewResponse'
 *       404:
 *         description: Performance review not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/approve",
  authenticate,
  requirePermission(["performance:approve"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const review = await performanceRepository.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Performance review not found",
        });
      }

      if (review.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Performance review is not completed",
        });
      }

      const updatedReview = await performanceRepository.update(req.params.id, {
        status: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Performance review approved successfully",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/employee/{employeeId}:
 *   get:
 *     summary: Get employee performance reviews
 *     description: Retrieve performance reviews for a specific employee
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to retrieve
 *     responses:
 *       200:
 *         description: Employee performance reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeePerformanceResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/employee/:employeeId",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const performanceRepository = new PerformanceRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const reviews = await performanceRepository.findByEmployee(
        req.params.employeeId,
        {
          limit: req.query.limit || 20,
        }
      );

      res.status(200).json({
        success: true,
        message: "Employee performance reviews retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/statistics/{employeeId}:
 *   get:
 *     summary: Get performance statistics
 *     description: Retrieve performance statistics for an employee
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Year for statistics
 *     responses:
 *       200:
 *         description: Performance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceStatisticsResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/statistics/:employeeId",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const performanceRepository = new PerformanceRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const year = req.query.year || new Date().getFullYear();
      const statistics = await performanceRepository.getStatistics(
        req.params.employeeId,
        year
      );

      res.status(200).json({
        success: true,
        message: "Performance statistics retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          year,
          statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/summary/{reviewPeriod}:
 *   get:
 *     summary: Get review summary
 *     description: Retrieve performance review summary for a specific period
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewPeriod
 *         required: true
 *         schema:
 *           type: string
 *         description: Review period
 *     responses:
 *       200:
 *         description: Review summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerformanceSummaryResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/summary/:reviewPeriod",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const summary = await performanceRepository.getSummary(
        req.params.reviewPeriod
      );

      res.status(200).json({
        success: true,
        message: "Review summary retrieved successfully",
        data: {
          reviewPeriod: req.params.reviewPeriod,
          summary,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/upcoming/{employeeId}:
 *   get:
 *     summary: Get upcoming reviews
 *     description: Retrieve upcoming performance reviews for an employee
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Upcoming reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpcomingReviewsResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/upcoming/:employeeId",
  authenticate,
  requirePermission(["performance:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const performanceRepository = new PerformanceRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const upcomingReviews = await performanceRepository.getUpcomingReviews(
        req.params.employeeId
      );

      res.status(200).json({
        success: true,
        message: "Upcoming reviews retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          upcomingReviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /performance/pending:
 *   get:
 *     summary: Get pending reviews
 *     description: Retrieve all pending performance reviews
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to retrieve
 *     responses:
 *       200:
 *         description: Pending reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PendingPerformanceResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/pending",
  authenticate,
  requirePermission(["performance:approve"]),
  async (req, res, next) => {
    try {
      const performanceRepository = new PerformanceRepository();
      const pendingReviews = await performanceRepository.findPending({
        limit: req.query.limit || 50,
      });

      res.status(200).json({
        success: true,
        message: "Pending reviews retrieved successfully",
        data: pendingReviews,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
