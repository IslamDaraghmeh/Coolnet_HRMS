const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const ShiftRepository = require("../../infrastructure/db/repositories/ShiftRepository");
const ShiftAssignmentRepository = require("../../infrastructure/db/repositories/ShiftAssignmentRepository");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management endpoints
 */

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Create new shift
 *     description: Create a new shift definition
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShiftRequest'
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
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
  requirePermission(["shifts:create"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const shift = await shiftRepository.create(req.body);

      res.status(201).json({
        success: true,
        message: "Shift created successfully",
        data: shift,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get shifts
 *     description: Retrieve shifts with optional filters
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *         description: Shifts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["shifts:read"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const filters = {};
      const options = req.query;

      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === "true";
      }

      const result = await shiftRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Shifts retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     description: Retrieve a specific shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       404:
 *         description: Shift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["shifts:read"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const shift = await shiftRepository.findById(req.params.id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Shift not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Shift retrieved successfully",
        data: shift,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update shift
 *     description: Update an existing shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShiftRequest'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       404:
 *         description: Shift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["shifts:update"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const shift = await shiftRepository.findById(req.params.id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Shift not found",
        });
      }

      const updatedShift = await shiftRepository.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Shift updated successfully",
        data: updatedShift,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     description: Delete a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       404:
 *         description: Shift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission(["shifts:delete"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const shift = await shiftRepository.findById(req.params.id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Shift not found",
        });
      }

      await shiftRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Shift deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/assignments:
 *   post:
 *     summary: Create shift assignment
 *     description: Assign a shift to an employee
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShiftAssignmentRequest'
 *     responses:
 *       201:
 *         description: Shift assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftAssignmentResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/assignments",
  authenticate,
  requirePermission(["shifts:assign"]),
  async (req, res, next) => {
    try {
      const shiftAssignmentRepository = new ShiftAssignmentRepository();
      const employeeRepository = new EmployeeRepository();
      const shiftRepository = new ShiftRepository();

      // Validate employee exists
      const employee = await employeeRepository.findById(req.body.employeeId);
      if (!employee) {
        return res.status(400).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Validate shift exists
      const shift = await shiftRepository.findById(req.body.shiftId);
      if (!shift) {
        return res.status(400).json({
          success: false,
          message: "Shift not found",
        });
      }

      // Check for conflicts
      const conflicts = await shiftAssignmentRepository.checkConflicts(
        req.body.employeeId,
        req.body.startDate,
        req.body.endDate
      );

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Shift assignment conflicts with existing assignments",
          data: conflicts,
        });
      }

      const assignment = await shiftAssignmentRepository.create({
        ...req.body,
        assignedBy: req.user.id,
        assignedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Shift assignment created successfully",
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/assignments:
 *   get:
 *     summary: Get shift assignments
 *     description: Retrieve shift assignments with optional filters
 *     tags: [Shifts]
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
 *         name: shiftId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by shift ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *         description: Shift assignments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftAssignmentListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/assignments",
  authenticate,
  requirePermission(["shifts:read"]),
  async (req, res, next) => {
    try {
      const shiftAssignmentRepository = new ShiftAssignmentRepository();
      const filters = {};
      const options = req.query;

      if (req.query.employeeId) filters.employeeId = req.query.employeeId;
      if (req.query.shiftId) filters.shiftId = req.query.shiftId;
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === "true";
      }

      const result = await shiftAssignmentRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Shift assignments retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/assignments/{id}:
 *   get:
 *     summary: Get shift assignment by ID
 *     description: Retrieve a specific shift assignment
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Shift assignment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftAssignmentResponse'
 *       404:
 *         description: Shift assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/assignments/:id",
  authenticate,
  requirePermission(["shifts:read"]),
  async (req, res, next) => {
    try {
      const shiftAssignmentRepository = new ShiftAssignmentRepository();
      const assignment = await shiftAssignmentRepository.findByIdWithDetails(
        req.params.id
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Shift assignment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Shift assignment retrieved successfully",
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/assignments/{id}:
 *   put:
 *     summary: Update shift assignment
 *     description: Update an existing shift assignment
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShiftAssignmentRequest'
 *     responses:
 *       200:
 *         description: Shift assignment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftAssignmentResponse'
 *       404:
 *         description: Shift assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/assignments/:id",
  authenticate,
  requirePermission(["shifts:update"]),
  async (req, res, next) => {
    try {
      const shiftAssignmentRepository = new ShiftAssignmentRepository();
      const assignment = await shiftAssignmentRepository.findById(
        req.params.id
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Shift assignment not found",
        });
      }

      const updatedAssignment = await shiftAssignmentRepository.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Shift assignment updated successfully",
        data: updatedAssignment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/assignments/{id}:
 *   delete:
 *     summary: Delete shift assignment
 *     description: Delete a shift assignment
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Shift assignment deleted successfully
 *       404:
 *         description: Shift assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/assignments/:id",
  authenticate,
  requirePermission(["shifts:delete"]),
  async (req, res, next) => {
    try {
      const shiftAssignmentRepository = new ShiftAssignmentRepository();
      const assignment = await shiftAssignmentRepository.findById(
        req.params.id
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Shift assignment not found",
        });
      }

      await shiftAssignmentRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Shift assignment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /shifts/active:
 *   get:
 *     summary: Get active shifts
 *     description: Retrieve all active shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active shifts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveShiftListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/active",
  authenticate,
  requirePermission(["shifts:read"]),
  async (req, res, next) => {
    try {
      const shiftRepository = new ShiftRepository();
      const activeShifts = await shiftRepository.findActive();

      res.status(200).json({
        success: true,
        message: "Active shifts retrieved successfully",
        data: activeShifts,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
