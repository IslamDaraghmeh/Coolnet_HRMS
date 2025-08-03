const { ValidationError, NotFoundError } = require("../../../utils/errors");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Update Employee Use Case
 * Handles employee update business logic
 */
class UpdateEmployeeUseCase {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute employee update
   * @param {string} employeeId - Employee ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async execute(employeeId, updateData) {
    try {
      // Validate employee ID
      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      // Validate update data
      this.validateUpdateData(updateData);

      // Check if employee exists
      const existingEmployee = await this.employeeRepository.findById(
        employeeId
      );
      if (!existingEmployee) {
        throw new NotFoundError("Employee not found");
      }

      // Check for conflicts if email is being updated
      if (updateData.email && updateData.email !== existingEmployee.email) {
        await this.checkEmailConflict(updateData.email, employeeId);
      }

      // Update employee
      const updatedEmployee = await this.employeeRepository.update(
        employeeId,
        updateData
      );

      return {
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Data to validate
   */
  validateUpdateData(updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ValidationError("Update data is required");
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new ValidationError("Invalid email format");
      }
    }

    // Validate phone number format if provided
    if (updateData.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(updateData.phoneNumber)) {
        throw new ValidationError("Invalid phone number format");
      }
    }

    // Validate salary if provided
    if (updateData.salary !== undefined) {
      if (typeof updateData.salary !== "number" || updateData.salary < 0) {
        throw new ValidationError("Salary must be a positive number");
      }
    }

    // Validate hire date if provided
    if (updateData.hireDate) {
      const hireDate = new Date(updateData.hireDate);
      if (isNaN(hireDate.getTime())) {
        throw new ValidationError("Invalid hire date");
      }
    }
  }

  /**
   * Check for email conflict
   * @param {string} email - Email to check
   * @param {string} excludeEmployeeId - Employee ID to exclude from check
   */
  async checkEmailConflict(email, excludeEmployeeId) {
    const existingEmployee = await this.employeeRepository.findByEmail(email);
    if (existingEmployee && existingEmployee.id !== excludeEmployeeId) {
      throw new ValidationError("Email is already in use by another employee");
    }
  }
}

module.exports = UpdateEmployeeUseCase;
