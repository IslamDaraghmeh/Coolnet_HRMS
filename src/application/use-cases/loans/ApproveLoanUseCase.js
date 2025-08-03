const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");
const { ValidationError, NotFoundError } = require("../../../utils/errors");

/**
 * Approve Loan Use Case
 * Handles the business logic for approving or rejecting loan requests
 */
class ApproveLoanUseCase {
  constructor(loanRepository) {
    if (!(loanRepository instanceof ILoanRepository)) {
      throw new Error("Invalid loan repository");
    }
    this.loanRepository = loanRepository;
  }

  /**
   * Execute the use case
   * @param {string} loanId - Loan ID
   * @param {Object} approvalData - Approval data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated loan
   */
  async execute(loanId, approvalData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "finance_manager"].includes(role.name)
        )
      ) {
        throw new ValidationError("Insufficient permissions to approve loans");
      }

      // Check if loan exists
      const existingLoan = await this.loanRepository.findById(loanId);
      if (!existingLoan) {
        throw new NotFoundError("Loan not found");
      }

      // Validate loan status
      if (existingLoan.status !== "pending") {
        throw new ValidationError(
          "Only pending loans can be approved or rejected"
        );
      }

      // Validate approval data
      await this.validateApprovalData(approvalData);

      // Prepare update data
      const updateData = {
        status: approvalData.status,
        approvedBy: user.id,
        approvedAt: new Date(),
        approvalComments: approvalData.comments || null,
      };

      // If approved, set disbursement date
      if (approvalData.status === "approved") {
        updateData.disbursementDate =
          approvalData.disbursementDate || new Date();
        updateData.disbursementMethod =
          approvalData.disbursementMethod || "bank_transfer";
      }

      // Update loan
      const updatedLoan = await this.loanRepository.update(loanId, updateData);

      return {
        success: true,
        data: updatedLoan,
        message: `Loan ${approvalData.status} successfully`,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate approval data
   * @param {Object} approvalData - Approval data
   */
  async validateApprovalData(approvalData) {
    const { status, comments, disbursementDate, disbursementMethod } =
      approvalData;

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      throw new ValidationError(
        "Status must be either 'approved' or 'rejected'"
      );
    }

    // Validate comments length
    if (comments && comments.length > 500) {
      throw new ValidationError("Comments must not exceed 500 characters");
    }

    // Validate disbursement date if provided
    if (disbursementDate) {
      const disbursement = new Date(disbursementDate);
      const now = new Date();

      if (disbursement < now) {
        throw new ValidationError("Disbursement date cannot be in the past");
      }
    }

    // Validate disbursement method if provided
    if (
      disbursementMethod &&
      !["bank_transfer", "check", "cash"].includes(disbursementMethod)
    ) {
      throw new ValidationError("Invalid disbursement method");
    }
  }
}

module.exports = ApproveLoanUseCase;
