const { ValidationError } = require("../../../utils/errors");
const LeaveRepository = require("../../../infrastructure/db/repositories/LeaveRepository");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Create Leave Use Case
 * Handles leave request creation business logic
 */
class CreateLeaveUseCase {
  constructor() {
    this.leaveRepository = new LeaveRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute leave creation
   * @param {Object} leaveData - Leave request data
   * @returns {Promise<Object>} Creation result
   */
  async execute(leaveData) {
    try {
      const {
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason,
        attachments,
        emergencyContact,
      } = leaveData;

      // Validate required fields
      this.validateRequiredFields(leaveData);

      // Check if employee exists and is active
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new ValidationError("Employee not found");
      }

      if (!employee.isActive) {
        throw new ValidationError("Employee is not active");
      }

      // Calculate total days
      const totalDays = this.calculateLeaveDays(startDate, endDate);

      // Check for leave conflicts
      const conflicts = await this.leaveRepository.checkConflicts(
        employeeId,
        startDate,
        endDate
      );
      if (conflicts.length > 0) {
        throw new ValidationError(
          "Leave request conflicts with existing approved leaves"
        );
      }

      // Check leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalance = await this.leaveRepository.getLeaveBalance(
        employeeId,
        currentYear
      );

      if (
        leaveBalance[leaveType] &&
        leaveBalance[leaveType].remaining < totalDays
      ) {
        throw new ValidationError(`Insufficient ${leaveType} leave balance`);
      }

      // Create leave request
      const leave = await this.leaveRepository.create({
        employeeId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        attachments,
        emergencyContact,
        status: "pending",
        submittedAt: new Date(),
      });

      return {
        success: true,
        message: "Leave request created successfully",
        data: {
          leaveId: leave.id,
          employeeId: leave.employeeId,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: leave.totalDays,
          status: leave.status,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate required fields
   * @param {Object} leaveData - Leave data
   */
  validateRequiredFields(leaveData) {
    const requiredFields = [
      "employeeId",
      "leaveType",
      "startDate",
      "endDate",
      "reason",
    ];

    const missingFields = requiredFields.filter((field) => !leaveData[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    // Validate dates
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new ValidationError("Start date cannot be in the past");
    }

    if (endDate < startDate) {
      throw new ValidationError("End date must be after start date");
    }

    // Validate leave type
    const validLeaveTypes = [
      "annual",
      "sick",
      "personal",
      "maternity",
      "paternity",
      "bereavement",
      "unpaid",
    ];
    if (!validLeaveTypes.includes(leaveData.leaveType)) {
      throw new ValidationError("Invalid leave type");
    }
  }

  /**
   * Calculate leave days
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {number} Number of days
   */
  calculateLeaveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }
}

module.exports = CreateLeaveUseCase;
