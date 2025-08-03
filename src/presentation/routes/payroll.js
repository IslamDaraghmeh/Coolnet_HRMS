const express = require("express");
const router = express.Router();
const { authenticate, requirePermission } = require("../middlewares/auth");
const PayrollRepository = require("../../infrastructure/db/repositories/PayrollRepository");
const { ValidationError } = require("../../domain/errors");

const payrollRepository = new PayrollRepository();

/**
 * @swagger
 * /payroll:
 *   get:
 *     summary: Get all payroll records
 *     tags: [Payroll]
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
 *         description: Number of records per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, approved, paid, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: payPeriod
 *         schema:
 *           type: string
 *         description: Filter by pay period
 *     responses:
 *       200:
 *         description: Payroll records retrieved successfully
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
 *                     $ref: '#/components/schemas/Payroll'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticate,
  requirePermission("payroll:read"),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, employeeId, status, payPeriod } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        filters: {
          employeeId,
          status,
          payPeriod,
        },
      };

      const payrollRecords = await payrollRepository.findAll({}, options);

      res.json({
        success: true,
        message: "Payroll records retrieved successfully",
        data: payrollRecords,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /payroll/{id}:
 *   get:
 *     summary: Get payroll record by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *     responses:
 *       200:
 *         description: Payroll record retrieved successfully
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
 *                   $ref: '#/components/schemas/Payroll'
 *       404:
 *         description: Payroll record not found
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("payroll:read"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const payrollRecord = await payrollRepository.findById(id);

      if (!payrollRecord) {
        return res.status(404).json({
          success: false,
          message: "Payroll record not found",
          error: "NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Payroll record retrieved successfully",
        data: payrollRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /payroll:
 *   post:
 *     summary: Create new payroll record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - payPeriod
 *               - payDate
 *               - startDate
 *               - endDate
 *               - basicSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Employee ID
 *               payPeriod:
 *                 type: string
 *                 description: Pay period (e.g., "2024-01")
 *               payDate:
 *                 type: string
 *                 format: date
 *                 description: Pay date
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Period start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Period end date
 *               basicSalary:
 *                 type: number
 *                 description: Basic salary amount
 *               allowances:
 *                 type: object
 *                 description: Allowances breakdown
 *               overtimePay:
 *                 type: number
 *                 description: Overtime pay amount
 *               bonuses:
 *                 type: object
 *                 description: Bonuses breakdown
 *               deductions:
 *                 type: object
 *                 description: Deductions breakdown
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Payroll record created successfully
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
 *                   $ref: '#/components/schemas/Payroll'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("payroll:create"),
  async (req, res, next) => {
    try {
      const payrollData = req.body;

      // Validate required fields
      const requiredFields = [
        "employeeId",
        "payPeriod",
        "payDate",
        "startDate",
        "endDate",
        "basicSalary",
      ];

      for (const field of requiredFields) {
        if (!payrollData[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      // Calculate totals
      const totalAllowances = payrollData.allowances
        ? Object.values(payrollData.allowances).reduce(
            (sum, amount) => sum + (amount || 0),
            0
          )
        : 0;

      const totalBonuses = payrollData.bonuses
        ? Object.values(payrollData.bonuses).reduce(
            (sum, amount) => sum + (amount || 0),
            0
          )
        : 0;

      const totalDeductions = payrollData.deductions
        ? Object.values(payrollData.deductions).reduce(
            (sum, amount) => sum + (amount || 0),
            0
          )
        : 0;

      const grossPay =
        payrollData.basicSalary +
        totalAllowances +
        (payrollData.overtimePay || 0) +
        totalBonuses;
      const netPay =
        grossPay -
        totalDeductions -
        (payrollData.taxAmount || 0) -
        (payrollData.insuranceAmount || 0) -
        (payrollData.pensionAmount || 0) -
        (payrollData.loanDeductions || 0);

      const newPayrollRecord = await payrollRepository.create({
        ...payrollData,
        totalAllowances,
        totalBonuses,
        totalDeductions,
        grossPay,
        netPay,
        status: "draft",
        workingDays: payrollData.workingDays || 0,
        overtimeHours: payrollData.overtimeHours || 0,
        leaveDays: payrollData.leaveDays || 0,
      });

      res.status(201).json({
        success: true,
        message: "Payroll record created successfully",
        data: newPayrollRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /payroll/{id}:
 *   put:
 *     summary: Update payroll record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, pending, approved, paid, cancelled]
 *               approvedBy:
 *                 type: string
 *               approvedAt:
 *                 type: string
 *                 format: date-time
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, check, cash]
 *               referenceNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll record updated successfully
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
 *                   $ref: '#/components/schemas/Payroll'
 *       404:
 *         description: Payroll record not found
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  requirePermission("payroll:update"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingRecord = await payrollRepository.findById(id);

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: "Payroll record not found",
          error: "NOT_FOUND",
        });
      }

      // Handle status changes
      if (updateData.status === "approved" && !existingRecord.approvedAt) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = req.user.id;
      }

      if (updateData.status === "paid" && !existingRecord.paidAt) {
        updateData.paidAt = new Date();
      }

      const updatedRecord = await payrollRepository.update(id, updateData);

      res.json({
        success: true,
        message: "Payroll record updated successfully",
        data: updatedRecord,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /payroll/{id}:
 *   delete:
 *     summary: Delete payroll record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *     responses:
 *       200:
 *         description: Payroll record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Payroll record not found
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("payroll:delete"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const existingRecord = await payrollRepository.findById(id);

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: "Payroll record not found",
          error: "NOT_FOUND",
        });
      }

      await payrollRepository.delete(id);

      res.json({
        success: true,
        message: "Payroll record deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
