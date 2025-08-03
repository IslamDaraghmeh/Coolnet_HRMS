const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");
const { NotFoundError } = require("../../../utils/errors");

/**
 * Get Shift Use Case
 * Handles the business logic for retrieving shift details
 */
class GetShiftUseCase {
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
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Shift details
   */
  async execute(shiftId, user, options = {}) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "shift_manager", "employee"].includes(
            role.name
          )
        )
      ) {
        throw new Error("Insufficient permissions to view shifts");
      }

      // Get shift with optional assignments
      const includeAssignments = options.includeAssignments || false;
      let shift;

      if (includeAssignments) {
        shift = await this.shiftRepository.findByIdWithAssignments(shiftId);
      } else {
        shift = await this.shiftRepository.findById(shiftId);
      }

      if (!shift) {
        throw new NotFoundError("Shift not found");
      }

      return {
        success: true,
        data: shift,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GetShiftUseCase;
