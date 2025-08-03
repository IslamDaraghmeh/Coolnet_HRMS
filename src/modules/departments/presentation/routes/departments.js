const express = require("express");
const router = express.Router();
const asyncHandler = require("../../../../shared/utils/asyncHandler");
const { authenticate: authMiddleware } = require("../../../../presentation/middlewares/auth");
const auditMiddlewareInstance = require("../../../../presentation/middlewares/audit");
const {
  validateCreateDepartment,
  validateUpdateDepartment,
} = require("../validators/departments");

// Import use cases
const CreateDepartmentUseCase = require("../../application/use-cases/CreateDepartmentUseCase");
const UpdateDepartmentUseCase = require("../../application/use-cases/UpdateDepartmentUseCase");
const GetDepartmentUseCase = require("../../application/use-cases/GetDepartmentUseCase");
const ListDepartmentsUseCase = require("../../application/use-cases/ListDepartmentsUseCase");
const DeleteDepartmentUseCase = require("../../application/use-cases/DeleteDepartmentUseCase");
const AssignEmployeeToDepartmentUseCase = require("../../application/use-cases/AssignEmployeeToDepartmentUseCase");

// Import repository
const DepartmentRepository = require("../../infrastructure/repositories/DepartmentRepository");

// Initialize repository
const departmentRepository = new DepartmentRepository();

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               code:
 *                 type: string
 *                 description: Department code
 *               description:
 *                 type: string
 *                 description: Department description
 *               parentDepartmentId:
 *                 type: string
 *                 format: uuid
 *                 description: Parent department ID
 *               headId:
 *                 type: string
 *                 format: uuid
 *                 description: Department head employee ID
 *               settings:
 *                 type: object
 *                 description: Department settings
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  auditMiddlewareInstance.logCreate("departments"),
  validateCreateDepartment,
  asyncHandler(async (req, res) => {
    const createDepartmentUseCase = new CreateDepartmentUseCase(
      departmentRepository
    );
    const department = await createDepartmentUseCase.execute(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  })
);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
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
 *         name: parentDepartmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by parent department
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: includeEmployees
 *         schema:
 *           type: boolean
 *         description: Include employee data
 *     responses:
 *       200:
 *         description: List of departments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const listDepartmentsUseCase = new ListDepartmentsUseCase(
      departmentRepository
    );
    const result = await listDepartmentsUseCase.execute(req.query);

    res.json({
      success: true,
      message: "Departments retrieved successfully",
      data: result,
    });
  })
);

/**
 * @swagger
 * /api/departments/root:
 *   get:
 *     summary: Get root departments (no parent)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of root departments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/root",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const departments = await departmentRepository.getRootDepartments();

    res.json({
      success: true,
      message: "Root departments retrieved successfully",
      data: departments,
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const getDepartmentUseCase = new GetDepartmentUseCase(departmentRepository);
    const department = await getDepartmentUseCase.execute(req.params.id);

    res.json({
      success: true,
      message: "Department retrieved successfully",
      data: department,
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}/hierarchy:
 *   get:
 *     summary: Get department hierarchy
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department hierarchy
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id/hierarchy",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const hierarchy = await departmentRepository.getHierarchy(req.params.id);

    res.json({
      success: true,
      message: "Department hierarchy retrieved successfully",
      data: hierarchy,
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               code:
 *                 type: string
 *                 description: Department code
 *               description:
 *                 type: string
 *                 description: Department description
 *               parentDepartmentId:
 *                 type: string
 *                 format: uuid
 *                 description: Parent department ID
 *               headId:
 *                 type: string
 *                 format: uuid
 *                 description: Department head employee ID
 *               isActive:
 *                 type: boolean
 *                 description: Department active status
 *               settings:
 *                 type: object
 *                 description: Department settings
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  auditMiddlewareInstance.logUpdate("departments"),
  validateUpdateDepartment,
  asyncHandler(async (req, res) => {
    const updateDepartmentUseCase = new UpdateDepartmentUseCase(
      departmentRepository
    );
    const department = await updateDepartmentUseCase.execute(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 *       400:
 *         description: Cannot delete department with employees or sub-departments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authMiddleware,
  auditMiddlewareInstance.logDelete("departments"),
  asyncHandler(async (req, res) => {
    const deleteDepartmentUseCase = new DeleteDepartmentUseCase(
      departmentRepository
    );
    await deleteDepartmentUseCase.execute(req.params.id);

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}/employees:
 *   get:
 *     summary: Get department employees
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
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
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position
 *     responses:
 *       200:
 *         description: Department employees
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id/employees",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await departmentRepository.getEmployees(
      req.params.id,
      req.query
    );

    res.json({
      success: true,
      message: "Department employees retrieved successfully",
      data: result,
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}/employees/{employeeId}:
 *   post:
 *     summary: Assign employee to department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee assigned successfully
 *       404:
 *         description: Department or employee not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/employees/:employeeId",
  authMiddleware,
  auditMiddlewareInstance.logCreate("department_employees"),
  asyncHandler(async (req, res) => {
    const assignEmployeeUseCase = new AssignEmployeeToDepartmentUseCase(
      departmentRepository
    );
    await assignEmployeeUseCase.execute(req.params.id, req.params.employeeId);

    res.json({
      success: true,
      message: "Employee assigned to department successfully",
    });
  })
);

/**
 * @swagger
 * /api/departments/{id}/employees/{employeeId}:
 *   delete:
 *     summary: Remove employee from department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee removed successfully
 *       404:
 *         description: Department or employee not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id/employees/:employeeId",
  authMiddleware,
  auditMiddlewareInstance.logDelete("department_employees"),
  asyncHandler(async (req, res) => {
    await departmentRepository.removeEmployee(
      req.params.id,
      req.params.employeeId
    );

    res.json({
      success: true,
      message: "Employee removed from department successfully",
    });
  })
);

module.exports = router;
