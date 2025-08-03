const { ValidationError, UnauthorizedError } = require("../../../utils/errors");
const LeaveRepository = require("../../../infrastructure/db/repositories/LeaveRepository");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");

/**
 * Approve Leave Use Case
 * Handles leave approval business logic
 */
class ApproveLeaveUseCase {
  constructor() {
    this.leaveRepository = new LeaveRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Execute leave approval
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Approval result
   */
  async execute(approvalData) {
    try {
      const { leaveId, status, comments, approvedBy } = approvalData;

      // Validate required fields
      if (!leaveId) {
        throw new ValidationError("Leave ID is required");
      }

      if (!status) {
        throw new ValidationError("Status is required");
      }

      if (!approvedBy) {
        throw new ValidationError("Approver ID is required");
      }

      if (!["approved", "rejected"].includes(status)) {
        throw new ValidationError("Status must be approved or rejected");
      }

      // Check if approver exists and has permission
      const approver = await this.userRepository.findByIdWithPermissions(
        approvedBy
      );
      if (!approver) {
        throw new ValidationError("Approver not found");
      }

      if (!approver.permissions.includes("leaves:approve")) {
        throw new UnauthorizedError(
          "Insufficient permissions to approve leaves"
        );
      }

      // Find leave request
      const leave = await this.leaveRepository.findById(leaveId);
      if (!leave) {
        throw new ValidationError("Leave request not found");
      }

      if (leave.status !== "pending") {
        throw new ValidationError("Leave request is not pending approval");
      }

      // Update leave status
      const updateData = {
        status,
        approvedAt: new Date(),
        approvedBy,
      };

      if (comments) {
        updateData.comments = comments;
      }

      const updatedLeave = await this.leaveRepository.update(
        leaveId,
        updateData
      );

      return {
        success: true,
        message: `Leave request ${status} successfully`,
        data: {
          leaveId: updatedLeave.id,
          employeeId: updatedLeave.employeeId,
          status: updatedLeave.status,
          approvedBy: updatedLeave.approvedBy,
          approvedAt: updatedLeave.approvedAt,
          comments: updatedLeave.comments,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ApproveLeaveUseCase;
