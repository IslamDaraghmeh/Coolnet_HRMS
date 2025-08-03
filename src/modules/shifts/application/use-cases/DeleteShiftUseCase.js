const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");
const { ValidationError, NotFoundError } = require("../../../utils/errors");

/**
 * Delete Shift Use Case
 * Handles the business logic for deleting a shift
 */
class DeleteShiftUseCase {
  constructor(shiftRepository) {
    if (!(shiftRepository instanceof IShiftRepository)) {
      throw new Error("Invalid shift repository");
    }
    this.shiftRepository = shiftRepository;
  }

  /**
   * Execute the use case
   * @param {string} shiftId - Shift ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Deletion result
   */
  async execute(shiftId, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) => ["admin", "hr_manager"].includes(role.name))
      ) {
        throw new ValidationError("Insufficient permissions to delete shifts");
      }

      // Check if shift exists
      const existingShift = await this.shiftRepository.findById(shiftId);
      if (!existingShift) {
        throw new NotFoundError("Shift not found");
      }

      // Check for active assignments
      await this.checkActiveAssignments(shiftId);

      // Delete shift
      const deleted = await this.shiftRepository.delete(shiftId);

      if (!deleted) {
        throw new Error("Failed to delete shift");
      }

      return {
        success: true,
        message: "Shift deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check for active assignments
   * @param {string} shiftId - Shift ID
   */
  async checkActiveAssignments(shiftId) {
    try {
      const shiftWithAssignments =
        await this.shiftRepository.findByIdWithAssignments(shiftId);

      if (shiftWithAssignments && shiftWithAssignments.assignments) {
        const activeAssignments = shiftWithAssignments.assignments.filter(
          (assignment) => assignment.isActive
        );

        if (activeAssignments.length > 0) {
          throw new ValidationError(
            `Cannot delete shift with ${activeAssignments.length} active assignments. Please reassign or deactivate assignments first.`
          );
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      // If we can't check assignments, we'll proceed with deletion
      console.warn("Could not check shift assignments:", error.message);
    }
  }
}

module.exports = DeleteShiftUseCase;
