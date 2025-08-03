const express = require("express");
const router = express.Router();

// Import use cases
const CreateBranchUseCase = require("../../application/use-cases/branches/CreateBranchUseCase");
const UpdateBranchUseCase = require("../../application/use-cases/branches/UpdateBranchUseCase");
const GetBranchUseCase = require("../../application/use-cases/branches/GetBranchUseCase");
const ListBranchesUseCase = require("../../application/use-cases/branches/ListBranchesUseCase");
const DeleteBranchUseCase = require("../../application/use-cases/branches/DeleteBranchUseCase");

// Import repositories
const BranchRepository = require("../../infrastructure/db/repositories/BranchRepository");

// Import middlewares
const {
  authenticate,
  authorize,
  requirePermission,
} = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");

// Import validators
const {
  createBranch,
  updateBranch,
  branchId,
  branchFilters,
  branchOptions,
} = require("../validators/branches");

// Initialize repositories and use cases
const branchRepository = new BranchRepository();
const createBranchUseCase = new CreateBranchUseCase(branchRepository);
const updateBranchUseCase = new UpdateBranchUseCase(branchRepository);
const getBranchUseCase = new GetBranchUseCase(branchRepository);
const listBranchesUseCase = new ListBranchesUseCase(branchRepository);
const deleteBranchUseCase = new DeleteBranchUseCase(branchRepository);

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - address
 *         - contactInfo
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Branch unique identifier
 *         name:
 *           type: string
 *           description: Branch name
 *         code:
 *           type: string
 *           description: Unique branch code
 *         description:
 *           type: string
 *           description: Branch description
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             postalCode:
 *               type: string
 *         contactInfo:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *             fax:
 *               type: string
 *         managerId:
 *           type: string
 *           format: uuid
 *           description: Branch manager employee ID
 *         parentBranchId:
 *           type: string
 *           format: uuid
 *           description: Parent branch ID for hierarchy
 *         timezone:
 *           type: string
 *           description: Branch timezone
 *         workingHours:
 *           type: object
 *           description: Working hours for each day
 *         capacity:
 *           type: integer
 *           description: Maximum number of employees
 *         currentEmployees:
 *           type: integer
 *           description: Current number of employees
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Available facilities
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance, closed]
 *           description: Branch status
 *         isHeadquarters:
 *           type: boolean
 *           description: Whether this is headquarters
 *         establishedDate:
 *           type: string
 *           format: date
 *           description: Date when branch was established
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: List all branches
 *     tags: [Branches]
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
 *         description: Search term for name, code, or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, closed]
 *         description: Filter by status
 *       - in: query
 *         name: isHeadquarters
 *         schema:
 *           type: boolean
 *         description: Filter by headquarters status
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by manager
 *     responses:
 *       200:
 *         description: List of branches
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
 *                     $ref: '#/components/schemas/Branch'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission("branches:read"),
  // validate(branchFilters, "query"),
  // validate(branchOptions, "query"),
  async (req, res, next) => {
    try {
      const filters = req.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "name",
        sortOrder: req.query.sortOrder || "ASC",
        search: req.query.search,
        status: req.query.status,
        isHeadquarters: req.query.isHeadquarters,
        managerId: req.query.managerId,
      };

      const result = await listBranchesUseCase.execute(
        filters,
        options,
        req.user
      );

      res.json(result);
    } catch (error) {
      console.error("❌ Error in branches route:", error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *                 message:
 *                   type: string
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
  requirePermission(["branches:create"]),
  validate(createBranch),
  async (req, res, next) => {
    try {
      const result = await createBranchUseCase.execute(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Get branch by ID
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch ID
 *       - in: query
 *         name: includeEmployees
 *         schema:
 *           type: boolean
 *         description: Include employee list
 *       - in: query
 *         name: includeManager
 *         schema:
 *           type: boolean
 *         description: Include manager details
 *       - in: query
 *         name: includeHierarchy
 *         schema:
 *           type: boolean
 *         description: Include hierarchy information
 *     responses:
 *       200:
 *         description: Branch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["branches:read"]),
  validate(branchId, "params"),
  async (req, res, next) => {
    try {
      const options = {
        includeEmployees: req.query.includeEmployees === "true",
        includeManager: req.query.includeManager === "true",
        includeHierarchy: req.query.includeHierarchy === "true",
      };

      const result = await getBranchUseCase.execute(
        req.params.id,
        req.user,
        options
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Update branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["branches:update"]),
  validate(branchId, "params"),
  validate(updateBranch),
  async (req, res, next) => {
    try {
      const result = await updateBranchUseCase.execute(
        req.params.id,
        req.body,
        req.user
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Delete branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission(["branches:delete"]),
  validate(branchId, "params"),
  async (req, res, next) => {
    try {
      const result = await deleteBranchUseCase.execute(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/headquarters:
 *   get:
 *     summary: Get headquarters branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Headquarters branch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Headquarters not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/headquarters",
  authenticate,
  requirePermission(["branches:read"]),
  async (req, res, next) => {
    try {
      const headquarters = await branchRepository.findHeadquarters();
      if (!headquarters) {
        return res.status(404).json({
          success: false,
          message: "Headquarters branch not found",
        });
      }

      res.json({
        success: true,
        data: headquarters,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/{id}/statistics:
 *   get:
 *     summary: Get branch statistics
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     branchId:
 *                       type: string
 *                       format: uuid
 *                     totalEmployees:
 *                       type: integer
 *                     totalSubBranches:
 *                       type: integer
 *                     capacityUtilization:
 *                       type: number
 *                     status:
 *                       type: string
 *                     isHeadquarters:
 *                       type: boolean
 *       404:
 *         description: Branch not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id/statistics",
  authenticate,
  requirePermission(["branches:read"]),
  validate(branchId, "params"),
  async (req, res, next) => {
    try {
      const statistics = await branchRepository.getStatistics(req.params.id);
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/branches/{id}/hierarchy:
 *   get:
 *     summary: Get branch hierarchy
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch hierarchy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     branch:
 *                       $ref: '#/components/schemas/Branch'
 *                     parent:
 *                       $ref: '#/components/schemas/Branch'
 *                     children:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *                     ancestors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id/hierarchy",
  authenticate,
  requirePermission(["branches:read"]),
  validate(branchId, "params"),
  async (req, res, next) => {
    try {
      const hierarchy = await branchRepository.findHierarchy(req.params.id);
      if (!hierarchy) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      res.json({
        success: true,
        data: hierarchy,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
