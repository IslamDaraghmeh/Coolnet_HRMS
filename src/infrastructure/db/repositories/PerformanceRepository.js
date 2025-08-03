const { Op } = require("sequelize");
const PerformanceReview = require("../../../domain/entities/PerformanceReview");
const IPerformanceRepository = require("../../../domain/interfaces/IPerformanceRepository");

/**
 * Performance Repository Implementation
 * Sequelize-based implementation of performance review data access
 */
class PerformanceRepository extends IPerformanceRepository {
  /**
   * Create a new performance review
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created review
   */
  async create(reviewData) {
    try {
      const review = await PerformanceReview.create(reviewData);
      return review;
    } catch (error) {
      throw new Error(`Failed to create performance review: ${error.message}`);
    }
  }

  /**
   * Find review by ID
   * @param {string} id - Review ID
   * @returns {Promise<Object|null>} Review or null
   */
  async findById(id) {
    try {
      const review = await PerformanceReview.findByPk(id);
      return review;
    } catch (error) {
      throw new Error(
        `Failed to find performance review by ID: ${error.message}`
      );
    }
  }

  /**
   * Find all reviews with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "reviewDate",
        sortOrder = "DESC",
        search,
        employeeId,
        reviewerId,
        reviewPeriod,
        status,
        minRating,
        maxRating,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (reviewerId) where.reviewerId = reviewerId;
      if (reviewPeriod) where.reviewPeriod = reviewPeriod;
      if (status) where.status = status;

      // Apply rating range filter
      if (minRating || maxRating) {
        where.overallRating = {};
        if (minRating) where.overallRating[Op.gte] = minRating;
        if (maxRating) where.overallRating[Op.lte] = maxRating;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { reviewPeriod: { [Op.iLike]: `%${search}%` } },
          { reviewerComments: { [Op.iLike]: `%${search}%` } },
          { employeeComments: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await PerformanceReview.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        reviews: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find performance reviews: ${error.message}`);
    }
  }

  /**
   * Find reviews by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 20, sortBy = "reviewDate", sortOrder = "DESC" } = options;

      const reviews = await PerformanceReview.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return reviews;
    } catch (error) {
      throw new Error(
        `Failed to find performance reviews by employee: ${error.message}`
      );
    }
  }

  /**
   * Find reviews by reviewer
   * @param {string} reviewerId - Reviewer ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByReviewer(reviewerId, options = {}) {
    try {
      const { limit = 50, sortBy = "reviewDate", sortOrder = "DESC" } = options;

      const reviews = await PerformanceReview.findAll({
        where: { reviewerId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return reviews;
    } catch (error) {
      throw new Error(
        `Failed to find performance reviews by reviewer: ${error.message}`
      );
    }
  }

  /**
   * Find reviews by period
   * @param {string} reviewPeriod - Review period
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByPeriod(reviewPeriod, options = {}) {
    try {
      const { limit = 100, sortBy = "reviewDate", sortOrder = "ASC" } = options;

      const reviews = await PerformanceReview.findAll({
        where: { reviewPeriod },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return reviews;
    } catch (error) {
      throw new Error(
        `Failed to find performance reviews by period: ${error.message}`
      );
    }
  }

  /**
   * Find pending reviews
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending reviews
   */
  async findPending(options = {}) {
    try {
      const { limit = 50, sortBy = "reviewDate", sortOrder = "ASC" } = options;

      const reviews = await PerformanceReview.findAll({
        where: { status: "pending" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return reviews;
    } catch (error) {
      throw new Error(
        `Failed to find pending performance reviews: ${error.message}`
      );
    }
  }

  /**
   * Find completed reviews
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of completed reviews
   */
  async findCompleted(options = {}) {
    try {
      const { limit = 50, sortBy = "reviewDate", sortOrder = "DESC" } = options;

      const reviews = await PerformanceReview.findAll({
        where: { status: "completed" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return reviews;
    } catch (error) {
      throw new Error(
        `Failed to find completed performance reviews: ${error.message}`
      );
    }
  }

  /**
   * Update review
   * @param {string} id - Review ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated review
   */
  async update(id, updateData) {
    try {
      const review = await PerformanceReview.findByPk(id);
      if (!review) {
        throw new Error("Performance review not found");
      }

      await review.update(updateData);
      return review;
    } catch (error) {
      throw new Error(`Failed to update performance review: ${error.message}`);
    }
  }

  /**
   * Delete review
   * @param {string} id - Review ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const review = await PerformanceReview.findByPk(id);
      if (!review) {
        throw new Error("Performance review not found");
      }

      await review.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete performance review: ${error.message}`);
    }
  }

  /**
   * Count reviews
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await PerformanceReview.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count performance reviews: ${error.message}`);
    }
  }

  /**
   * Get review with employee and reviewer details
   * @param {string} id - Review ID
   * @returns {Promise<Object>} Review with details
   */
  async findByIdWithDetails(id) {
    try {
      const review = await PerformanceReview.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
          {
            model: require("../../../domain/entities/User"),
            as: "reviewer",
          },
        ],
      });
      return review;
    } catch (error) {
      throw new Error(
        `Failed to find performance review with details: ${error.message}`
      );
    }
  }

  /**
   * Get performance statistics
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Performance statistics
   */
  async getStatistics(employeeId, year) {
    try {
      const reviews = await this.findByEmployee(employeeId, { limit: 1000 });
      const yearReviews = reviews.filter(
        (r) => new Date(r.reviewDate).getFullYear() === year
      );

      const stats = {
        year,
        totalReviews: yearReviews.length,
        averageRating:
          yearReviews.length > 0
            ? yearReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) /
              yearReviews.length
            : 0,
        averageScore:
          yearReviews.length > 0
            ? yearReviews.reduce(
                (sum, r) => sum + parseFloat(r.performanceScore || 0),
                0
              ) / yearReviews.length
            : 0,
        completedReviews: yearReviews.filter((r) => r.status === "completed")
          .length,
        pendingReviews: yearReviews.filter((r) => r.status === "pending")
          .length,
        byPeriod: {},
        byRating: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };

      // Group by period
      yearReviews.forEach((review) => {
        const period = review.reviewPeriod;
        if (!stats.byPeriod[period]) {
          stats.byPeriod[period] = {
            count: 0,
            averageRating: 0,
            averageScore: 0,
          };
        }
        stats.byPeriod[period].count++;
        stats.byPeriod[period].averageRating += review.overallRating || 0;
        stats.byPeriod[period].averageScore += parseFloat(
          review.performanceScore || 0
        );
      });

      // Calculate averages for periods
      Object.keys(stats.byPeriod).forEach((period) => {
        const periodStats = stats.byPeriod[period];
        if (periodStats.count > 0) {
          periodStats.averageRating /= periodStats.count;
          periodStats.averageScore /= periodStats.count;
        }
      });

      // Group by rating
      yearReviews.forEach((review) => {
        const rating = review.overallRating;
        if (rating && rating >= 1 && rating <= 5) {
          stats.byRating[rating]++;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get performance statistics: ${error.message}`);
    }
  }

  /**
   * Get review summary
   * @param {string} reviewPeriod - Review period
   * @returns {Promise<Object>} Review summary
   */
  async getSummary(reviewPeriod) {
    try {
      const reviews = await this.findByPeriod(reviewPeriod, { limit: 1000 });

      const summary = {
        reviewPeriod,
        totalReviews: reviews.length,
        completedReviews: reviews.filter((r) => r.status === "completed")
          .length,
        pendingReviews: reviews.filter((r) => r.status === "pending").length,
        draftReviews: reviews.filter((r) => r.status === "draft").length,
        averageRating:
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) /
              reviews.length
            : 0,
        averageScore:
          reviews.length > 0
            ? reviews.reduce(
                (sum, r) => sum + parseFloat(r.performanceScore || 0),
                0
              ) / reviews.length
            : 0,
        byRating: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        byStatus: {},
      };

      // Group by rating
      reviews.forEach((review) => {
        const rating = review.overallRating;
        if (rating && rating >= 1 && rating <= 5) {
          summary.byRating[rating]++;
        }
      });

      // Group by status
      reviews.forEach((review) => {
        const status = review.status;
        if (!summary.byStatus[status]) {
          summary.byStatus[status] = {
            count: 0,
            averageRating: 0,
          };
        }
        summary.byStatus[status].count++;
        summary.byStatus[status].averageRating += review.overallRating || 0;
      });

      // Calculate averages for statuses
      Object.keys(summary.byStatus).forEach((status) => {
        const statusStats = summary.byStatus[status];
        if (statusStats.count > 0) {
          statusStats.averageRating /= statusStats.count;
        }
      });

      return summary;
    } catch (error) {
      throw new Error(`Failed to get review summary: ${error.message}`);
    }
  }

  /**
   * Get upcoming reviews
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of upcoming reviews
   */
  async getUpcomingReviews(employeeId) {
    try {
      const today = new Date();
      const upcomingReviews = await PerformanceReview.findAll({
        where: {
          employeeId,
          reviewDate: {
            [Op.gte]: today,
          },
          status: ["draft", "pending"],
        },
        order: [["reviewDate", "ASC"]],
        limit: 10,
      });

      return upcomingReviews;
    } catch (error) {
      throw new Error(`Failed to get upcoming reviews: ${error.message}`);
    }
  }
}

module.exports = PerformanceRepository;
