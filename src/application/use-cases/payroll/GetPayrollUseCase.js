const IPayrollRepository = require("../../../domain/interfaces/IPayrollRepository");
const { NotFoundError } = require("../../../utils/errors");

/**
 * Get Payroll Use Case
 * Handles the business logic for retrieving payroll details
 */
class GetPayrollUseCase {
  constructor(payrollRepository) {
    if (!(payrollRepository instanceof IPayrollRepository)) {
      throw new Error("Invalid payroll repository");
    }
    this.payrollRepository = payrollRepository;
  }

  /**
   * Execute the use case
   * @param {string} payrollId - Payroll ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Payroll details
   */
  async execute(payrollId, user) {
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
        throw new Error("Insufficient permissions to view payroll");
      }

      // Get payroll details
      const payroll = await this.payrollRepository.findById(payrollId);
      if (!payroll) {
        throw new NotFoundError("Payroll not found");
      }

      // Check if user has permission to view this specific payroll
      if (
        user.roles.some((role) => role.name === "employee") &&
        payroll.employeeId !== user.employeeId
      ) {
        throw new Error("You can only view your own payroll");
      }

      return {
        success: true,
        data: payroll,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GetPayrollUseCase;
