const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const employeeSchemas = require("../validators/employees");
const CreateEmployeeUseCase = require("../../application/use-cases/employees/CreateEmployeeUseCase");
const GetEmployeeUseCase = require("../../application/use-cases/employees/GetEmployeeUseCase");
const UpdateEmployeeUseCase = require("../../application/use-cases/employees/UpdateEmployeeUseCase");
const DeleteEmployeeUseCase = require("../../application/use-cases/employees/DeleteEmployeeUseCase");
const ListEmployeesUseCase = require("../../application/use-cases/employees/ListEmployeesUseCase");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, terminated, on-leave]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Employees endpoint - implementation pending",
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Get employee endpoint - implementation pending",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create new employee
 *     description: Create a new employee record
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeRequest'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
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
        requirePermission(["employees:create"]),
  validate(employeeSchemas.createEmployee),
  async (req, res, next) => {
    try {
      const createEmployeeUseCase = new CreateEmployeeUseCase();
      const result = await createEmployeeUseCase.execute(req.body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get employees
 *     description: Retrieve employees with optional filters
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or employee ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, terminated]
 *         description: Filter by status
 *       - in: query
 *         name: hireDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date from
 *       - in: query
 *         name: hireDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date to
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: fullName
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["employees:read"]),
  validate(employeeSchemas.employeeFilters, "query"),
  validate(employeeSchemas.employeeOptions, "query"),
  async (req, res, next) => {
    try {
      const listEmployeesUseCase = new ListEmployeesUseCase();
      const filters = req.query;
      const options = req.query;

      const result = await listEmployeesUseCase.execute(filters, options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Retrieve a specific employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["employees:read"]),
  validate(employeeSchemas.employeeId, "params"),
  async (req, res, next) => {
    try {
      const getEmployeeUseCase = new GetEmployeeUseCase();
      const result = await getEmployeeUseCase.execute(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update employee
 *     description: Update an existing employee record
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeRequest'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["employees:update"]),
  validate(employeeSchemas.employeeId, "params"),
  validate(employeeSchemas.updateEmployee),
  async (req, res, next) => {
    try {
      const updateEmployeeUseCase = new UpdateEmployeeUseCase();
      const result = await updateEmployeeUseCase.execute(
        req.params.id,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     description: Delete an employee record (soft delete)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission(["employees:delete"]),
  validate(employeeSchemas.employeeId, "params"),
  async (req, res, next) => {
    try {
      const deleteEmployeeUseCase = new DeleteEmployeeUseCase();
      const result = await deleteEmployeeUseCase.execute(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/{id}/activate:
 *   post:
 *     summary: Activate employee
 *     description: Activate an inactive employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/activate",
  authenticate,
  requirePermission(["employees:update"]),
  validate(employeeSchemas.employeeId, "params"),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const employee = await employeeRepository.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      if (employee.isActive) {
        return res.status(400).json({
          success: false,
          message: "Employee is already active",
        });
      }

      const updatedEmployee = await employeeRepository.update(req.params.id, {
        isActive: true,
        terminatedAt: null,
        terminationReason: null,
      });

      res.status(200).json({
        success: true,
        message: "Employee activated successfully",
        data: updatedEmployee,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/{id}/terminate:
 *   post:
 *     summary: Terminate employee
 *     description: Terminate an active employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TerminateEmployeeRequest'
 *     responses:
 *       200:
 *         description: Employee terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:id/terminate",
  authenticate,
  requirePermission(["employees:update"]),
  validate(employeeSchemas.employeeId, "params"),
  validate(employeeSchemas.terminateEmployee),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const employee = await employeeRepository.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
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

      const updatedEmployee = await employeeRepository.update(req.params.id, {
        isActive: false,
        terminatedAt: new Date(),
        terminationReason: req.body.reason,
      });

      res.status(200).json({
        success: true,
        message: "Employee terminated successfully",
        data: updatedEmployee,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/departments:
 *   get:
 *     summary: Get departments
 *     description: Retrieve list of all departments
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/departments",
  authenticate,
  requirePermission(["employees:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const departments = await employeeRepository.getDepartments();

      res.status(200).json({
        success: true,
        message: "Departments retrieved successfully",
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/positions:
 *   get:
 *     summary: Get positions
 *     description: Retrieve list of all positions
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Positions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PositionListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/positions",
  authenticate,
  requirePermission(["employees:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const positions = await employeeRepository.getPositions();

      res.status(200).json({
        success: true,
        message: "Positions retrieved successfully",
        data: positions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /employees/statistics:
 *   get:
 *     summary: Get employee statistics
 *     description: Retrieve employee statistics and analytics
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeStatisticsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/statistics",
  authenticate,
  requirePermission(["employees:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const statistics = await employeeRepository.getStatistics();

      res.status(200).json({
        success: true,
        message: "Employee statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
