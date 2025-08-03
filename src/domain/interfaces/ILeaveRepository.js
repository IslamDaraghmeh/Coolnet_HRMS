/**
 * Leave Repository Interface
 * Defines the contract for leave data access operations
 */
class ILeaveRepository {
  /**
   * Create a new leave request
   * @param {Object} leaveData - Leave data
   * @returns {Promise<Object>} Created leave request
   */
  async create(leaveData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find leave by ID
   * @param {string} id - Leave ID
   * @returns {Promise<Object|null>} Leave request or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all leave requests with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of leave requests
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find leave requests by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of leave requests
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find pending leave requests
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending leave requests
   */
  async findPending(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find approved leave requests
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of approved leave requests
   */
  async findApproved(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update leave request
   * @param {string} id - Leave ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated leave request
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete leave request
   * @param {string} id - Leave ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count leave requests
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get leave balance for employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Leave balance
   */
  async getLeaveBalance(employeeId, year) {
    throw new Error("Method not implemented");
  }

  /**
   * Get leave with employee details
   * @param {string} id - Leave ID
   * @returns {Promise<Object>} Leave with employee
   */
  async findByIdWithEmployee(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get leave with approval details
   * @param {string} id - Leave ID
   * @returns {Promise<Object>} Leave with approvals
   */
  async findByIdWithApprovals(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get leave statistics
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Leave statistics
   */
  async getStatistics(employeeId, year) {
    throw new Error("Method not implemented");
  }

  /**
   * Check leave conflicts
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {string} excludeId - Leave ID to exclude
   * @returns {Promise<Array>} Conflicting leaves
   */
  async checkConflicts(employeeId, startDate, endDate, excludeId = null) {
    throw new Error("Method not implemented");
  }
}

module.exports = ILeaveRepository;
