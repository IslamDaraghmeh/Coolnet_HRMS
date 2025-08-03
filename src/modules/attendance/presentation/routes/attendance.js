const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const attendanceSchemas = require("../validators/attendance");
const CheckInUseCase = require("../../application/use-cases/attendance/CheckInUseCase");
const CheckOutUseCase = require("../../application/use-cases/attendance/CheckOutUseCase");
const AttendanceRepository = require("../../infrastructure/db/repositories/AttendanceRepository");
const EmployeeRepository = require("../../infrastructure/db/repositories/EmployeeRepository");

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

/**
 * @swagger
 * /attendance/check-in:
 *   post:
 *     summary: Check in employee
 *     description: Record employee check-in for the current day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInRequest'
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckInResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/check-in",
  authenticate,
  requirePermission(["attendance:create"]),
  validate(attendanceSchemas.checkIn),
  async (req, res, next) => {
    try {
      const checkInUseCase = new CheckInUseCase();
      const result = await checkInUseCase.execute({
        ...req.body,
        employeeId: req.body.employeeId || req.user.employeeId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/check-out:
 *   post:
 *     summary: Check out employee
 *     description: Record employee check-out for the current day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckOutRequest'
 *     responses:
 *       200:
 *         description: Check-out successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckOutResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/check-out",
  authenticate,
  requirePermission(["attendance:create"]),
  validate(attendanceSchemas.checkOut),
  async (req, res, next) => {
    try {
      const checkOutUseCase = new CheckOutUseCase();
      const result = await checkOutUseCase.execute({
        ...req.body,
        employeeId: req.body.employeeId || req.user.employeeId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Retrieve attendance records with optional filters
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, early_departure, half_day]
 *         description: Filter by status
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
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  requirePermission(["attendance:read"]),
  validate(attendanceSchemas.attendanceFilters, "query"),
  validate(attendanceSchemas.attendanceOptions, "query"),
  async (req, res, next) => {
    try {
      const attendanceRepository = new AttendanceRepository();
      const filters = req.query;
      const options = req.query;

      const result = await attendanceRepository.findAll(filters, options);

      res.status(200).json({
        success: true,
        message: "Attendance records retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     description: Retrieve a specific attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceResponse'
 *       404:
 *         description: Attendance record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/:id",
  authenticate,
  requirePermission(["attendance:read"]),
  validate(attendanceSchemas.attendanceId, "params"),
  async (req, res, next) => {
    try {
      const attendanceRepository = new AttendanceRepository();
      const attendance = await attendanceRepository.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Attendance record retrieved successfully",
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     description: Update an existing attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttendanceRequest'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceResponse'
 *       404:
 *         description: Attendance record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  requirePermission(["attendance:update"]),
  validate(attendanceSchemas.attendanceId, "params"),
  validate(attendanceSchemas.updateAttendance),
  async (req, res, next) => {
    try {
      const attendanceRepository = new AttendanceRepository();
      const attendance = await attendanceRepository.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      const updatedAttendance = await attendanceRepository.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Attendance record updated successfully",
        data: updatedAttendance,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     description: Delete an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission(["attendance:delete"]),
  validate(attendanceSchemas.attendanceId, "params"),
  async (req, res, next) => {
    try {
      const attendanceRepository = new AttendanceRepository();
      const attendance = await attendanceRepository.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      await attendanceRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Attendance record deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/employee/{employeeId}:
 *   get:
 *     summary: Get employee attendance
 *     description: Retrieve attendance records for a specific employee
 *     tags: [Attendance]
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
 *           default: 30
 *         description: Number of records to retrieve
 *     responses:
 *       200:
 *         description: Employee attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeAttendanceResponse'
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
  requirePermission(["attendance:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const attendanceRepository = new AttendanceRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const attendance = await attendanceRepository.findByEmployee(
        req.params.employeeId,
        {
          limit: req.query.limit || 30,
        }
      );

      res.status(200).json({
        success: true,
        message: "Employee attendance retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          attendance,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /attendance/statistics/{employeeId}:
 *   get:
 *     summary: Get attendance statistics
 *     description: Retrieve attendance statistics for an employee
 *     tags: [Attendance]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceStatisticsResponse'
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
  requirePermission(["attendance:read"]),
  async (req, res, next) => {
    try {
      const employeeRepository = new EmployeeRepository();
      const attendanceRepository = new AttendanceRepository();

      const employee = await employeeRepository.findById(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const startDate =
        req.query.startDate ||
        new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
      const endDate =
        req.query.endDate || new Date().toISOString().split("T")[0];

      const statistics = await attendanceRepository.getStatistics(
        req.params.employeeId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: "Attendance statistics retrieved successfully",
        data: {
          employee: {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: employee.fullName,
          },
          period: {
            startDate,
            endDate,
          },
          statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
