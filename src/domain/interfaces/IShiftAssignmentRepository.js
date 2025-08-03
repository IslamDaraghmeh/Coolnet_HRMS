/**
 * Shift Assignment Repository Interface
 * Defines the contract for shift assignment data access operations
 */
class IShiftAssignmentRepository {
  /**
   * Create a new shift assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async create(assignmentData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find assignment by ID
   * @param {string} id - Assignment ID
   * @returns {Promise<Object|null>} Assignment or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all assignments with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find assignments by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find assignments by shift
   * @param {string} shiftId - Shift ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByShift(shiftId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active assignments
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active assignments
   */
  async findActive(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find assignments by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByDateRange(startDate, endDate, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update assignment
   * @param {string} id - Assignment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated assignment
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete assignment
   * @param {string} id - Assignment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count assignments
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get assignment with employee and shift details
   * @param {string} id - Assignment ID
   * @returns {Promise<Object>} Assignment with details
   */
  async findByIdWithDetails(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Check for assignment conflicts
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {string} excludeId - Assignment ID to exclude
   * @returns {Promise<Array>} Conflicting assignments
   */
  async checkConflicts(employeeId, startDate, endDate, excludeId = null) {
    throw new Error("Method not implemented");
  }
}

module.exports = IShiftAssignmentRepository;
