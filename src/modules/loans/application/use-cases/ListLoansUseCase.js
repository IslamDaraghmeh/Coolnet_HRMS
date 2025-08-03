const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");

/**
 * List Loans Use Case
 * Handles the business logic for retrieving loans with filters and pagination
 */
class ListLoansUseCase {
  constructor(loanRepository) {
    if (!(loanRepository instanceof ILoanRepository)) {
      throw new Error("Invalid loan repository");
    }
    this.loanRepository = loanRepository;
  }

  /**
   * Execute the use case
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @param {Object} user - Current user
   * @returns {Promise<Object>} List of loans with pagination
   */
  async execute(filters = {}, options = {}, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "finance_manager", "employee"].includes(
            role.name
          )
        )
      ) {
        throw new Error("Insufficient permissions to view loans");
      }

      // Apply role-based filters
      const roleFilters = await this.applyRoleFilters(filters, user);

      // Get loans
      const result = await this.loanRepository.findAll(roleFilters, options);

      return {
        success: true,
        data: result.loans,
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

    // If user is an employee, only show their own loans
    if (user.roles.some((role) => role.name === "employee")) {
      roleFilters.employeeId = user.employeeId;
    }

    // If user is a manager, only show loans from their department
    if (user.roles.some((role) => role.name === "manager") && user.department) {
      roleFilters.department = user.department;
    }

    return roleFilters;
  }
}

module.exports = ListLoansUseCase;
