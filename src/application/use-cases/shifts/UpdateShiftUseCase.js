const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");
const { ValidationError, NotFoundError } = require("../../../utils/errors");

/**
 * Update Shift Use Case
 * Handles the business logic for updating an existing shift
 */
class UpdateShiftUseCase {
  constructor(shiftRepository) {
    if (!(shiftRepository instanceof IShiftRepository)) {
      throw new Error("Invalid shift repository");
    }
    this.shiftRepository = shiftRepository;
  }

  /**
   * Execute the use case
   * @param {string} shiftId - Shift ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated shift
   */
  async execute(shiftId, updateData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "shift_manager"].includes(role.name)
        )
      ) {
        throw new ValidationError("Insufficient permissions to update shifts");
      }

      // Check if shift exists
      const existingShift = await this.shiftRepository.findById(shiftId);
      if (!existingShift) {
        throw new NotFoundError("Shift not found");
      }

      // Validate update data
      await this.validateUpdateData(updateData);

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== existingShift.name) {
        await this.checkDuplicateShift(updateData.name);
      }

      // Calculate total hours if times are being updated
      if (updateData.startTime || updateData.endTime) {
        const startTime = updateData.startTime || existingShift.startTime;
        const endTime = updateData.endTime || existingShift.endTime;
        updateData.totalHours = this.calculateTotalHours(startTime, endTime);
      }

      // Update shift
      const updatedShift = await this.shiftRepository.update(
        shiftId,
        updateData
      );

      return {
        success: true,
        data: updatedShift,
        message: "Shift updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Update data
   */
  async validateUpdateData(updateData) {
    const {
      name,
      startTime,
      endTime,
      breakDuration,
      maxEmployees,
      overtimeRate,
    } = updateData;

    // Validate name if provided
    if (name && name.trim().length < 2) {
      throw new ValidationError(
        "Shift name must be at least 2 characters long"
      );
    }

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      throw new ValidationError("Invalid start time format. Use HH:MM format");
    }
    if (endTime && !timeRegex.test(endTime)) {
      throw new ValidationError("Invalid end time format. Use HH:MM format");
    }

    // Validate time logic if both times are provided
    if (startTime && endTime) {
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);

      if (start >= end) {
        throw new ValidationError("End time must be after start time");
      }
    }

    // Validate break duration
    if (
      breakDuration !== undefined &&
      (breakDuration < 0 || breakDuration > 480)
    ) {
      throw new ValidationError(
        "Break duration must be between 0 and 480 minutes"
      );
    }

    // Validate max employees
    if (
      maxEmployees !== undefined &&
      (maxEmployees < 1 || maxEmployees > 1000)
    ) {
      throw new ValidationError("Maximum employees must be between 1 and 1000");
    }

    // Validate overtime rate
    if (
      overtimeRate !== undefined &&
      (overtimeRate < 1.0 || overtimeRate > 3.0)
    ) {
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

module.exports = UpdateShiftUseCase;
