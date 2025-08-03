const bcrypt = require("bcryptjs");
const { ValidationError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Register Use Case
 * Handles user registration business logic
 */
class RegisterUseCase {
  constructor() {
    this.userRepository = new UserRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute registration
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async execute(userData) {
    try {
      const {
        phoneNumber,
        email,
        password,
        confirmPassword,
        employeeId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
      } = userData;

      // Validate required fields
      this.validateRequiredFields(userData);

      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new ValidationError("Password and confirm password do not match");
      }

      // Validate password strength
      this.validatePassword(password);

      // Check if user already exists
      await this.checkExistingUser(phoneNumber, email, employeeId);

      // Create employee record first
      const employee = await this.createEmployee({
        employeeId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user record
      const user = await this.userRepository.create({
        phoneNumber,
        email,
        password: hashedPassword,
        employeeId: employee.id,
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
      });

      // Return user data without sensitive information
      const userResponse = {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        employeeId: user.employeeId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          fullName: employee.fullName,
          dateOfBirth: employee.dateOfBirth,
          gender: employee.gender,
          address: employee.address,
          emergencyContact: employee.emergencyContact,
        },
      };

      return {
        success: true,
        message: "User registered successfully",
        data: userResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate required fields
   * @param {Object} userData - User data
   */
  validateRequiredFields(userData) {
    const requiredFields = [
      "phoneNumber",
      "email",
      "password",
      "confirmPassword",
      "employeeId",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
    ];

    const missingFields = requiredFields.filter((field) => !userData[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   */
  validatePassword(password) {
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one lowercase letter"
      );
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one uppercase letter"
      );
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }
  }

  /**
   * Check if user already exists
   * @param {string} phoneNumber - Phone number
   * @param {string} email - Email
   * @param {string} employeeId - Employee ID
   */
  async checkExistingUser(phoneNumber, email, employeeId) {
    // Check by phone number
    const existingUserByPhone = await this.userRepository.findByPhone(
      phoneNumber
    );
    if (existingUserByPhone) {
      throw new ValidationError("User with this phone number already exists");
    }

    // Check by email
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ValidationError("User with this email already exists");
    }

    // Check by employee ID
    const existingUserByEmployeeId = await this.userRepository.findByEmployeeId(
      employeeId
    );
    if (existingUserByEmployeeId) {
      throw new ValidationError("User with this employee ID already exists");
    }

    // Check if employee record exists
    const existingEmployee = await this.employeeRepository.findByEmployeeId(
      employeeId
    );
    if (existingEmployee) {
      throw new ValidationError("Employee with this ID already exists");
    }
  }

  /**
   * Create employee record
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  async createEmployee(employeeData) {
    try {
      const employee = await this.employeeRepository.create(employeeData);
      return employee;
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }
}

module.exports = RegisterUseCase;
