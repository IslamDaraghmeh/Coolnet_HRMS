const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const leaveSchemas = require("../validators/leaves");
const CreateLeaveUseCase = require("../../application/use-cases/leaves/CreateLeaveUseCase");
const ApproveLeaveUseCase = require("../../application/use-cases/leaves/ApproveLeaveUseCase");
const LeaveRepository = require("../../infrastructure/db/repositories/LeaveRepository");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave management endpoints
 */

/**
 * @swagger
 * /leaves:
 *   post:
 *     summary: Create leave request
 *     description: Create a new leave request for an employee
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveRequest'
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveResponse'
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
  requirePermission(["leaves:create"]),
  validate(leaveSchemas.createLeave),
  async (req, res, next) => {
    try {
      const createLeaveUseCase = new CreateLeaveUseCase();
      const result = await createLeaveUseCase.execute({
        ...req.body,
        employeeId: req.body.employeeId || req.user.employeeId,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves:
 *   get:
 *     summary: Get leave requests
 *     description: Retrieve leave requests with optional filters
 *     tags: [Leaves]
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
 *         name: leaveType
 *         schema:
 *           type: string
 *           enum: [annual, sick, personal, maternity, paternity, bereavement, unpaid]
 *         description: Filter by leave type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: startDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date from
 *       - in: query
 *         name: startDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date to
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
 *         description: Leave requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["leaves:read"]),
  validate(leaveSchemas.leaveFilters, "query"),
  validate(leaveSchemas.leaveOptions, "query"),
  async (req, res, next) => {
    try {
      const leaveRepository = new LeaveRepository();
      const filters = req.query;
      const options = req.query;

      const result = await leaveRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Leave requests retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     description: Retrieve a specific leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveResponse'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["leaves:read"]),
  validate(leaveSchemas.leaveId, "params"),
  async (req, res, next) => {
    try {
      const leaveRepository = new LeaveRepository();
      const leave = await leaveRepository.findByIdWithEmployee(req.params.id);

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Leave request retrieved successfully",
        data: leave,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/{id}:
 *   put:
 *     summary: Update leave request
 *     description: Update an existing leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeaveRequest'
 *     responses:
 *       200:
 *         description: Leave request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveResponse'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["leaves:update"]),
  validate(leaveSchemas.leaveId, "params"),
  validate(leaveSchemas.updateLeave),
  async (req, res, next) => {
    try {
      const leaveRepository = new LeaveRepository();
      const leave = await leaveRepository.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      // Only allow updates if leave is pending
      if (leave.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Cannot update leave request that is not pending",
        });
      }

      const updatedLeave = await leaveRepository.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Leave request updated successfully",
        data: updatedLeave,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/{id}/approve:
 *   post:
 *     summary: Approve or reject leave request
 *     description: Approve or reject a pending leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveLeaveRequest'
 *     responses:
 *       200:
 *         description: Leave request approved/rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveResponse'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/approve",
  authenticate,
  requirePermission(["leaves:approve"]),
  validate(leaveSchemas.leaveId, "params"),
  validate(leaveSchemas.approveLeave),
  async (req, res, next) => {
    try {
      const approveLeaveUseCase = new ApproveLeaveUseCase();
      const result = await approveLeaveUseCase.execute({
        leaveId: req.params.id,
        ...req.body,
        approvedBy: req.user.id,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/{id}/cancel:
 *   post:
 *     summary: Cancel leave request
 *     description: Cancel a pending or approved leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelLeaveRequest'
 *     responses:
 *       200:
 *         description: Leave request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveResponse'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/cancel",
  authenticate,
  requirePermission(["leaves:update"]),
  validate(leaveSchemas.leaveId, "params"),
  validate(leaveSchemas.cancelLeave),
  async (req, res, next) => {
    try {
      const leaveRepository = new LeaveRepository();
      const leave = await leaveRepository.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found",
        });
      }

      if (leave.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Leave request is already cancelled",
        });
      }

      if (leave.status === "rejected") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a rejected leave request",
        });
      }

      const updatedLeave = await leaveRepository.update(req.params.id, {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
        cancellationReason: req.body.reason,
      });

      res.status(200).json({
        success: true,
        message: "Leave request cancelled successfully",
        data: updatedLeave,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/employee/{employeeId}:
 *   get:
 *     summary: Get employee leave requests
 *     description: Retrieve leave requests for a specific employee
 *     tags: [Leaves]
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
 *         description: Employee leave requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeLeaveResponse'
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
  requirePermission(["leaves:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const leaveRepository = new LeaveRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const leaves = await leaveRepository.findByEmployee(
        req.params.employeeId,
        {
          limit: req.query.limit || 20,
        }
      );

      res.status(200).json({
        success: true,
        message: "Employee leave requests retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          leaves,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/balance/{employeeId}:
 *   get:
 *     summary: Get employee leave balance
 *     description: Retrieve leave balance for a specific employee
 *     tags: [Leaves]
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
 *         description: Year for leave balance
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveBalanceResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/balance/:employeeId",
  authenticate,
  requirePermission(["leaves:read"]),
  validate(leaveSchemas.leaveBalance, "query"),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const leaveRepository = new LeaveRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const year = req.query.year || new Date().getFullYear();
      const balance = await leaveRepository.getLeaveBalance(
        req.params.employeeId,
        year
      );

      res.status(200).json({
        success: true,
        message: "Leave balance retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          year,
          balance,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /leaves/pending:
 *   get:
 *     summary: Get pending leave requests
 *     description: Retrieve all pending leave requests for approval
 *     tags: [Leaves]
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
 *         description: Pending leave requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PendingLeaveResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/pending",
  authenticate,
  requirePermission(["leaves:approve"]),
  async (req, res, next) => {
    try {
      const leaveRepository = new LeaveRepository();
      const pendingLeaves = await leaveRepository.findPending({
        limit: req.query.limit || 50,
      });

      res.status(200).json({
        success: true,
        message: "Pending leave requests retrieved successfully",
        data: pendingLeaves,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
