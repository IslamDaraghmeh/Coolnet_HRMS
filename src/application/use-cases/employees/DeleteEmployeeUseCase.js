const { ValidationError, NotFoundError } = require("../../../utils/errors");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");

/**
 * Delete Employee Use Case
 * Handles employee deletion business logic
 */
class DeleteEmployeeUseCase {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Execute employee deletion
   * @param {string} employeeId - Employee ID
   * @param {boolean} forceDelete - Force delete without checks
   * @returns {Promise<Object>} Deletion result
   */
  async execute(employeeId, forceDelete = false) {
    try {
      // Validate employee ID
      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      // Check if employee exists
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new NotFoundError("Employee not found");
      }

      // Check if employee is active
      if (!employee.isActive && !forceDelete) {
        throw new ValidationError("Employee is already inactive");
      }

      // Check for dependencies if not force deleting
      if (!forceDelete) {
        await this.checkDependencies(employeeId);
      }

      // Delete employee
      const result = await this.employeeRepository.delete(employeeId);

      // Also delete associated user account if exists
      await this.deleteAssociatedUser(employee.employeeId);

      return {
        success: true,
        message: "Employee deleted successfully",
        data: {
          employeeId: employee.employeeId,
          deletedAt: new Date(),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check for dependencies
   * @param {string} employeeId - Employee ID
   */
  async checkDependencies(employeeId) {
    // Check for active attendance records
    const hasActiveAttendance = await this.checkActiveAttendance(employeeId);
    if (hasActiveAttendance) {
      throw new ValidationError(
        "Cannot delete employee with active attendance records"
      );
    }

    // Check for pending leave requests
    const hasPendingLeaves = await this.checkPendingLeaves(employeeId);
    if (hasPendingLeaves) {
      throw new ValidationError(
        "Cannot delete employee with pending leave requests"
      );
    }

    // Check for active loans
    const hasActiveLoans = await this.checkActiveLoans(employeeId);
    if (hasActiveLoans) {
      throw new ValidationError("Cannot delete employee with active loans");
    }

    // Check for active performance reviews
    const hasActiveReviews = await this.checkActiveReviews(employeeId);
    if (hasActiveReviews) {
      throw new ValidationError(
        "Cannot delete employee with active performance reviews"
      );
    }
  }

  /**
   * Check for active attendance records
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Has active attendance
   */
  async checkActiveAttendance(employeeId) {
    try {
      const { Op } = require("sequelize");
      const Attendance = require("../../../domain/entities/Attendance");

      const count = await Attendance.count({
        where: {
          employeeId,
          checkOutTime: null,
          date: {
            [Op.gte]: new Date().toISOString().split("T")[0],
          },
        },
      });

      return count > 0;
    } catch (error) {
      console.error("Error checking active attendance:", error);
      return false;
    }
  }

  /**
   * Check for pending leave requests
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Has pending leaves
   */
  async checkPendingLeaves(employeeId) {
    try {
      const Leave = require("../../../domain/entities/Leave");

      const count = await Leave.count({
        where: {
          employeeId,
          status: "pending",
        },
      });

      return count > 0;
    } catch (error) {
      console.error("Error checking pending leaves:", error);
      return false;
    }
  }

  /**
   * Check for active loans
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Has active loans
   */
  async checkActiveLoans(employeeId) {
    try {
      const Loan = require("../../../domain/entities/Loan");

      const count = await Loan.count({
        where: {
          employeeId,
          status: "active",
        },
      });

      return count > 0;
    } catch (error) {
      console.error("Error checking active loans:", error);
      return false;
    }
  }

  /**
   * Check for active performance reviews
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Has active reviews
   */
  async checkActiveReviews(employeeId) {
    try {
      const PerformanceReview = require("../../../domain/entities/PerformanceReview");

      const count = await PerformanceReview.count({
        where: {
          employeeId,
          status: "in_progress",
        },
      });

      return count > 0;
    } catch (error) {
      console.error("Error checking active reviews:", error);
      return false;
    }
  }

  /**
   * Delete associated user account
   * @param {string} employeeId - Employee ID
   */
  async deleteAssociatedUser(employeeId) {
    try {
      const user = await this.userRepository.findByEmployeeId(employeeId);
      if (user) {
        await this.userRepository.delete(user.id);
      }
    } catch (error) {
      console.error("Error deleting associated user:", error);
      // Don't throw error to avoid affecting employee deletion
    }
  }
}

module.exports = DeleteEmployeeUseCase;
