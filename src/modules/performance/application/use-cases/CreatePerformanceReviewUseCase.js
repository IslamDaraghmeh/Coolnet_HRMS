const IPerformanceRepository = require("../../../domain/interfaces/IPerformanceRepository");
const IEmployeeRepository = require("../../../domain/interfaces/IEmployeeRepository");
const { ValidationError } = require("../../../utils/errors");

/**
 * Create Performance Review Use Case
 * Handles the business logic for creating performance reviews
 */
class CreatePerformanceReviewUseCase {
  constructor(performanceRepository, employeeRepository) {
    if (!(performanceRepository instanceof IPerformanceRepository)) {
      throw new Error("Invalid performance repository");
    }
    if (!(employeeRepository instanceof IEmployeeRepository)) {
      throw new Error("Invalid employee repository");
    }
    this.performanceRepository = performanceRepository;
    this.employeeRepository = employeeRepository;
  }

  /**
   * Execute the use case
   * @param {Object} reviewData - Review data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created performance review
   */
  async execute(reviewData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "manager"].includes(role.name)
        )
      ) {
        throw new ValidationError(
          "Insufficient permissions to create performance reviews"
        );
      }

      // Validate review data
      await this.validateReviewData(reviewData);

      // Check if employee exists and is active
      await this.validateEmployee(reviewData.employeeId);

      // Check for existing reviews in the same period
      await this.checkExistingReview(
        reviewData.employeeId,
        reviewData.reviewPeriod
      );

      // Create review data
      const reviewToCreate = {
        ...reviewData,
        status: "draft",
        createdBy: user.id,
        createdAt: new Date(),
      };

      // Create performance review
      const review = await this.performanceRepository.create(reviewToCreate);

      return {
        success: true,
        data: review,
        message: "Performance review created successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate review data
   * @param {Object} reviewData - Review data
   */
  async validateReviewData(reviewData) {
    const { employeeId, reviewPeriod, reviewType, reviewerId } = reviewData;

    // Validate required fields
    if (!employeeId) {
      throw new ValidationError("Employee ID is required");
    }

    if (!reviewPeriod) {
      throw new ValidationError("Review period is required");
    }

    if (
      !reviewType ||
      !["quarterly", "annual", "probation", "project"].includes(reviewType)
    ) {
      throw new ValidationError("Valid review type is required");
    }

    if (!reviewerId) {
      throw new ValidationError("Reviewer ID is required");
    }

    // Validate review period format
    const periodRegex = /^\d{4}-(Q[1-4]|H[1-2]|Annual)$/;
    if (!periodRegex.test(reviewPeriod)) {
      throw new ValidationError(
        "Invalid review period format. Use YYYY-Q1, YYYY-Q2, YYYY-Q3, YYYY-Q4, YYYY-H1, YYYY-H2, or YYYY-Annual"
      );
    }

    // Validate scores if provided
    if (reviewData.scores) {
      await this.validateScores(reviewData.scores);
    }

    // Validate goals if provided
    if (reviewData.goals) {
      await this.validateGoals(reviewData.goals);
    }
  }

  /**
   * Validate employee
   * @param {string} employeeId - Employee ID
   */
  async validateEmployee(employeeId) {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new ValidationError("Employee not found");
    }

    if (employee.status !== "active") {
      throw new ValidationError(
        "Performance reviews can only be created for active employees"
      );
    }
  }

  /**
   * Check for existing review in the same period
   * @param {string} employeeId - Employee ID
   * @param {string} reviewPeriod - Review period
   */
  async checkExistingReview(employeeId, reviewPeriod) {
    const existingReviews =
      await this.performanceRepository.findByEmployeeAndPeriod(
        employeeId,
        reviewPeriod
      );

    if (existingReviews.length > 0) {
      throw new ValidationError(
        `Performance review already exists for employee in period ${reviewPeriod}`
      );
    }
  }

  /**
   * Validate scores
   * @param {Object} scores - Performance scores
   */
  async validateScores(scores) {
    const validCategories = [
      "job_knowledge",
      "quality_of_work",
      "quantity_of_work",
      "communication",
      "teamwork",
      "initiative",
      "problem_solving",
      "attendance",
      "punctuality",
      "overall_performance",
    ];

    for (const [category, score] of Object.entries(scores)) {
      if (!validCategories.includes(category)) {
        throw new ValidationError(`Invalid score category: ${category}`);
      }

      if (typeof score !== "number" || score < 1 || score > 5) {
        throw new ValidationError(
          `Score for ${category} must be between 1 and 5`
        );
      }
    }
  }

  /**
   * Validate goals
   * @param {Array} goals - Performance goals
   */
  async validateGoals(goals) {
    if (!Array.isArray(goals)) {
      throw new ValidationError("Goals must be an array");
    }

    for (const goal of goals) {
      if (!goal.title || goal.title.trim().length < 5) {
        throw new ValidationError(
          "Goal title must be at least 5 characters long"
        );
      }

      if (!goal.description || goal.description.trim().length < 10) {
        throw new ValidationError(
          "Goal description must be at least 10 characters long"
        );
      }

      if (goal.targetDate && new Date(goal.targetDate) <= new Date()) {
        throw new ValidationError("Goal target date must be in the future");
      }
    }
  }
}

module.exports = CreatePerformanceReviewUseCase;
