const { ValidationError } = require("../../../utils/errors");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Create Employee Use Case
 * Handles employee creation business logic
 */
class CreateEmployeeUseCase {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute employee creation
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Creation result
   */
  async execute(employeeData) {
    try {
      // Validate required fields
      this.validateRequiredFields(employeeData);

      // Validate employee ID format
      this.validateEmployeeId(employeeData.employeeId);

      // Check if employee already exists
      await this.checkExistingEmployee(
        employeeData.employeeId,
        employeeData.email
      );

      // Create employee
      const employee = await this.employeeRepository.create(employeeData);

      return {
        success: true,
        message: "Employee created successfully",
        data: employee,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate required fields
   * @param {Object} employeeData - Employee data
   */
  validateRequiredFields(employeeData) {
    const requiredFields = [
      "employeeId",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "email",
      "phoneNumber",
      "hireDate",
      "position",
      "department",
      "salary",
    ];

    const missingFields = requiredFields.filter(
      (field) => !employeeData[field]
    );
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * Validate employee ID format
   * @param {string} employeeId - Employee ID
   */
  validateEmployeeId(employeeId) {
    // Employee ID should be alphanumeric and 6-10 characters
    const employeeIdRegex = /^[A-Z0-9]{6,10}$/;
    if (!employeeIdRegex.test(employeeId)) {
      throw new ValidationError(
        "Employee ID must be 6-10 characters long and contain only uppercase letters and numbers"
      );
    }
  }

  /**
   * Check if employee already exists
   * @param {string} employeeId - Employee ID
   * @param {string} email - Email address
   */
  async checkExistingEmployee(employeeId, email) {
    // Check by employee ID
    const existingEmployeeById = await this.employeeRepository.findByEmployeeId(
      employeeId
    );
    if (existingEmployeeById) {
      throw new ValidationError("Employee with this ID already exists");
    }

    // Check by email
    const existingEmployeeByEmail = await this.employeeRepository.findByEmail(
      email
    );
    if (existingEmployeeByEmail) {
      throw new ValidationError("Employee with this email already exists");
    }
  }
}

module.exports = CreateEmployeeUseCase;
