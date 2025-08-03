/**
 * Performance Repository Interface
 * Defines the contract for performance review data access operations
 */
class IPerformanceRepository {
  /**
   * Create a new performance review
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created review
   */
  async create(reviewData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find review by ID
   * @param {string} id - Review ID
   * @returns {Promise<Object|null>} Review or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all reviews with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find reviews by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find reviews by reviewer
   * @param {string} reviewerId - Reviewer ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByReviewer(reviewerId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find reviews by period
   * @param {string} reviewPeriod - Review period
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of reviews
   */
  async findByPeriod(reviewPeriod, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find pending reviews
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending reviews
   */
  async findPending(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find completed reviews
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of completed reviews
   */
  async findCompleted(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update review
   * @param {string} id - Review ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated review
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete review
   * @param {string} id - Review ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count reviews
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get review with employee and reviewer details
   * @param {string} id - Review ID
   * @returns {Promise<Object>} Review with details
   */
  async findByIdWithDetails(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get performance statistics
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Performance statistics
   */
  async getStatistics(employeeId, year) {
    throw new Error("Method not implemented");
  }

  /**
   * Get review summary
   * @param {string} reviewPeriod - Review period
   * @returns {Promise<Object>} Review summary
   */
  async getSummary(reviewPeriod) {
    throw new Error("Method not implemented");
  }

  /**
   * Get upcoming reviews
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Array>} Array of upcoming reviews
   */
  async getUpcomingReviews(employeeId) {
    throw new Error("Method not implemented");
  }
}

module.exports = IPerformanceRepository;
