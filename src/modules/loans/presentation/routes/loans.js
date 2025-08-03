const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const LoanRepository = require("../../infrastructure/db/repositories/LoanRepository");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management endpoints
 */

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Create new loan
 *     description: Create a new loan application
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLoanRequest'
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
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
  requirePermission(["loans:create"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
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

      // Calculate loan details
      const amount = parseFloat(req.body.amount);
      const interestRate = parseFloat(req.body.interestRate || 0);
      const termMonths = parseInt(req.body.termMonths);

      const totalAmount = amount + (amount * interestRate) / 100;
      const monthlyPayment = totalAmount / termMonths;

      const loan = await loanRepository.create({
        ...req.body,
        totalAmount,
        monthlyPayment,
        status: "pending",
      });

      res.status(201).json({
        success: true,
        message: "Loan created successfully",
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Get loans
 *     description: Retrieve loans with optional filters
 *     tags: [Loans]
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
 *         name: loanType
 *         schema:
 *           type: string
 *           enum: [personal, emergency, education, medical, housing]
 *         description: Filter by loan type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, active, completed, defaulted]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by purpose or guarantor name
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum loan amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum loan amount
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
 *         description: Loans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["loans:read"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const filters = {};
      const options = req.query;

      if (req.query.employeeId) filters.employeeId = req.query.employeeId;
      if (req.query.loanType) filters.loanType = req.query.loanType;
      if (req.query.status) filters.status = req.query.status;

      const result = await loanRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Loans retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     description: Retrieve a specific loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["loans:read"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const loan = await loanRepository.findByIdWithEmployee(req.params.id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Loan retrieved successfully",
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/{id}:
 *   put:
 *     summary: Update loan
 *     description: Update an existing loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLoanRequest'
 *     responses:
 *       200:
 *         description: Loan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["loans:update"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const loan = await loanRepository.findById(req.params.id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Only allow updates if loan is pending
      if (loan.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Cannot update loan that is not pending",
        });
      }

      const updatedLoan = await loanRepository.update(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Loan updated successfully",
        data: updatedLoan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/{id}/approve:
 *   post:
 *     summary: Approve loan
 *     description: Approve a pending loan application
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveLoanRequest'
 *     responses:
 *       200:
 *         description: Loan approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/approve",
  authenticate,
  requirePermission(["loans:approve"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const loan = await loanRepository.findById(req.params.id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      if (loan.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Loan is not pending approval",
        });
      }

      const approvedAmount = req.body.approvedAmount || loan.amount;
      const startDate = req.body.startDate || new Date();

      const updatedLoan = await loanRepository.update(req.params.id, {
        status: "approved",
        approvedAmount,
        startDate,
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Loan approved successfully",
        data: updatedLoan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/{id}/reject:
 *   post:
 *     summary: Reject loan
 *     description: Reject a pending loan application
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectLoanRequest'
 *     responses:
 *       200:
 *         description: Loan rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/reject",
  authenticate,
  requirePermission(["loans:approve"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const loan = await loanRepository.findById(req.params.id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      if (loan.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Loan is not pending approval",
        });
      }

      const updatedLoan = await loanRepository.update(req.params.id, {
        status: "rejected",
        approvedBy: req.user.id,
        approvedAt: new Date(),
        notes: req.body.reason,
      });

      res.status(200).json({
        success: true,
        message: "Loan rejected successfully",
        data: updatedLoan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/employee/{employeeId}:
 *   get:
 *     summary: Get employee loans
 *     description: Retrieve loans for a specific employee
 *     tags: [Loans]
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
 *         description: Employee loans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeLoanResponse'
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
  requirePermission(["loans:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const loanRepository = new LoanRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const loans = await loanRepository.findByEmployee(req.params.employeeId, {
        limit: req.query.limit || 20,
      });

      res.status(200).json({
        success: true,
        message: "Employee loans retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          loans,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /loans/statistics/{employeeId}:
 *   get:
 *     summary: Get loan statistics
 *     description: Retrieve loan statistics for an employee
 *     tags: [Loans]
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
 *         description: Loan statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanStatisticsResponse'
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
  requirePermission(["loans:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const loanRepository = new LoanRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const statistics = await loanRepository.getStatistics(
        req.params.employeeId
      );

      res.status(200).json({
        success: true,
        message: "Loan statistics retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
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
 * /loans/balance/{employeeId}:
 *   get:
 *     summary: Get loan balance
 *     description: Retrieve current loan balance for an employee
 *     tags: [Loans]
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
 *         description: Loan balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanBalanceResponse'
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
  requirePermission(["loans:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const loanRepository = new LoanRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const balance = await loanRepository.getLoanBalance(
        req.params.employeeId
      );

      res.status(200).json({
        success: true,
        message: "Loan balance retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
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
 * /loans/pending:
 *   get:
 *     summary: Get pending loans
 *     description: Retrieve all pending loan applications
 *     tags: [Loans]
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
 *         description: Pending loans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PendingLoanResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/pending",
  authenticate,
  requirePermission(["loans:approve"]),
  async (req, res, next) => {
    try {
      const loanRepository = new LoanRepository();
      const pendingLoans = await loanRepository.findPending({
        limit: req.query.limit || 50,
      });

      res.status(200).json({
        success: true,
        message: "Pending loans retrieved successfully",
        data: pendingLoans,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
