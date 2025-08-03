const { ValidationError, NotFoundError } = require("../../../utils/errors");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Get Employee Use Case
 * Handles employee retrieval business logic
 */
class GetEmployeeUseCase {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute employee retrieval
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Employee data
   */
  async execute(employeeId, options = {}) {
    try {
      // Validate employee ID
      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      // Get employee with optional includes
      const employee = await this.getEmployeeWithIncludes(employeeId, options);

      if (!employee) {
        throw new NotFoundError("Employee not found");
      }

      return {
        success: true,
        data: employee,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get employee with includes
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Employee with includes
   */
  async getEmployeeWithIncludes(employeeId, options) {
    const {
      includeUser,
      includeAttendance,
      includeLeaves,
      includePerformance,
    } = options;

    if (includeUser) {
      return await this.employeeRepository.findByIdWithUser(employeeId);
    }

    if (includeAttendance) {
      return await this.employeeRepository.findByIdWithAttendance(employeeId);
    }

    if (includeLeaves) {
      return await this.employeeRepository.findByIdWithLeaves(employeeId);
    }

    if (includePerformance) {
      return await this.employeeRepository.findByIdWithPerformance(employeeId);
    }

    // Default: return basic employee data
    return await this.employeeRepository.findById(employeeId);
  }
}

module.exports = GetEmployeeUseCase;
