const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");
const { ValidationError } = require("../../../utils/errors");

/**
 * Create Shift Use Case
 * Handles the business logic for creating a new shift
 */
class CreateShiftUseCase {
  constructor(shiftRepository) {
    if (!(shiftRepository instanceof IShiftRepository)) {
      throw new Error("Invalid shift repository");
    }
    this.shiftRepository = shiftRepository;
  }

  /**
   * Execute the use case
   * @param {Object} shiftData - Shift data
   * @param {string} shiftData.name - Shift name
   * @param {string} shiftData.description - Shift description
   * @param {string} shiftData.startTime - Start time (HH:MM)
   * @param {string} shiftData.endTime - End time (HH:MM)
   * @param {number} shiftData.breakDuration - Break duration in minutes
   * @param {string} shiftData.color - Shift color
   * @param {string} shiftData.department - Department
   * @param {number} shiftData.maxEmployees - Maximum employees
   * @param {boolean} shiftData.overtimeAllowed - Whether overtime is allowed
   * @param {number} shiftData.overtimeRate - Overtime rate multiplier
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created shift
   */
  async execute(shiftData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "shift_manager"].includes(role.name)
        )
      ) {
        throw new ValidationError("Insufficient permissions to create shifts");
      }

      // Validate shift data
      await this.validateShiftData(shiftData);

      // Check for duplicate shift name
      await this.checkDuplicateShift(shiftData.name);

      // Calculate total hours
      const totalHours = this.calculateTotalHours(
        shiftData.startTime,
        shiftData.endTime
      );

      // Create shift data
      const shiftToCreate = {
        ...shiftData,
        totalHours,
        isActive: true,
        createdBy: user.id,
      };

      // Create shift
      const shift = await this.shiftRepository.create(shiftToCreate);

      return {
        success: true,
        data: shift,
        message: "Shift created successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate shift data
   * @param {Object} shiftData - Shift data
   */
  async validateShiftData(shiftData) {
    const {
      name,
      startTime,
      endTime,
      breakDuration,
      maxEmployees,
      overtimeRate,
    } = shiftData;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      throw new ValidationError(
        "Shift name must be at least 2 characters long"
      );
    }

    if (!startTime || !endTime) {
      throw new ValidationError("Start time and end time are required");
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new ValidationError("Invalid time format. Use HH:MM format");
    }

    // Validate time logic
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    if (start >= end) {
      throw new ValidationError("End time must be after start time");
    }

    // Validate break duration
    if (breakDuration && (breakDuration < 0 || breakDuration > 480)) {
      throw new ValidationError(
        "Break duration must be between 0 and 480 minutes"
      );
    }

    // Validate max employees
    if (maxEmployees && (maxEmployees < 1 || maxEmployees > 1000)) {
      throw new ValidationError("Maximum employees must be between 1 and 1000");
    }

    // Validate overtime rate
    if (overtimeRate && (overtimeRate < 1.0 || overtimeRate > 3.0)) {
      throw new ValidationError("Overtime rate must be between 1.0 and 3.0");
    }
  }

  /**
   * Check for duplicate shift name
   * @param {string} name - Shift name
   */
  async checkDuplicateShift(name) {
    const existingShifts = await this.shiftRepository.findAll({ name });
    if (existingShifts.shifts && existingShifts.shifts.length > 0) {
      throw new ValidationError("Shift with this name already exists");
    }
  }

  /**
   * Calculate total hours
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @returns {number} Total hours
   */
  calculateTotalHours(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end - start) / (1000 * 60 * 60);
  }
}

module.exports = CreateShiftUseCase;
