const IPerformanceRepository = require("../../../domain/interfaces/IPerformanceRepository");
const { NotFoundError } = require("../../../utils/errors");

/**
 * Get Performance Review Use Case
 * Handles the business logic for retrieving performance review details
 */
class GetPerformanceReviewUseCase {
  constructor(performanceRepository) {
    if (!(performanceRepository instanceof IPerformanceRepository)) {
      throw new Error("Invalid performance repository");
    }
    this.performanceRepository = performanceRepository;
  }

  /**
   * Execute the use case
   * @param {string} reviewId - Review ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Performance review details
   */
  async execute(reviewId, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "manager", "employee"].includes(role.name)
        )
      ) {
        throw new Error("Insufficient permissions to view performance reviews");
      }

      // Get review details
      const review = await this.performanceRepository.findById(reviewId);
      if (!review) {
        throw new NotFoundError("Performance review not found");
      }

      // Check if user has permission to view this specific review
      if (
        user.roles.some((role) => role.name === "employee") &&
        review.employeeId !== user.employeeId
      ) {
        throw new Error("You can only view your own performance reviews");
      }

      // If user is a manager, check if they can view reviews for their team
      if (user.roles.some((role) => role.name === "manager")) {
        const canView = await this.checkManagerPermissions(user, review);
        if (!canView) {
          throw new Error(
            "You can only view performance reviews for your team members"
          );
        }
      }

      return {
        success: true,
        data: review,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check manager permissions
   * @param {Object} user - Current user
   * @param {Object} review - Performance review
   * @returns {boolean} Whether user can view the review
   */
  async checkManagerPermissions(user, review) {
    // This is a simplified check - in a real implementation,
    // you would check if the employee belongs to the manager's team
    return user.id === review.reviewerId || user.id === review.createdBy;
  }
}

module.exports = GetPerformanceReviewUseCase;
