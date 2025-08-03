const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");
const { NotFoundError } = require("../../../utils/errors");

/**
 * Get Loan Use Case
 * Handles the business logic for retrieving loan details
 */
class GetLoanUseCase {
  constructor(loanRepository) {
    if (!(loanRepository instanceof ILoanRepository)) {
      throw new Error("Invalid loan repository");
    }
    this.loanRepository = loanRepository;
  }

  /**
   * Execute the use case
   * @param {string} loanId - Loan ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Loan details
   */
  async execute(loanId, user) {
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

      // Get loan details
      const loan = await this.loanRepository.findById(loanId);
      if (!loan) {
        throw new NotFoundError("Loan not found");
      }

      // Check if user has permission to view this specific loan
      if (
        user.roles.some((role) => role.name === "employee") &&
        loan.employeeId !== user.employeeId
      ) {
        throw new Error("You can only view your own loans");
      }

      return {
        success: true,
        data: loan,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GetLoanUseCase;
