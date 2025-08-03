const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");

/**
 * List Shifts Use Case
 * Handles the business logic for retrieving shifts with filters and pagination
 */
class ListShiftsUseCase {
  constructor(shiftRepository) {
    if (!(shiftRepository instanceof IShiftRepository)) {
      throw new Error("Invalid shift repository");
    }
    this.shiftRepository = shiftRepository;
  }

  /**
   * Execute the use case
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @param {Object} user - Current user
   * @returns {Promise<Object>} List of shifts with pagination
   */
  async execute(filters = {}, options = {}, user) {
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

      // Apply role-based filters
      const roleFilters = await this.applyRoleFilters(filters, user);

      // Get shifts
      const result = await this.shiftRepository.findAll(roleFilters, options);

      return {
        success: true,
        data: result.shifts,
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Apply role-based filters
   * @param {Object} filters - Original filters
   * @param {Object} user - Current user
   * @returns {Object} Filtered criteria
   */
  async applyRoleFilters(filters, user) {
    const roleFilters = { ...filters };

    // If user is an employee, only show active shifts
    if (user.roles.some((role) => role.name === "employee")) {
      roleFilters.isActive = true;
    }

    // If user is a shift manager, only show shifts for their department
    if (
      user.roles.some((role) => role.name === "shift_manager") &&
      user.department
    ) {
      roleFilters.department = user.department;
    }

    return roleFilters;
  }
}

module.exports = ListShiftsUseCase;
