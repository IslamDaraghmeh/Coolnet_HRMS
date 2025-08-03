/**
 * Shift Repository Interface
 * Defines the contract for shift data access operations
 */
class IShiftRepository {
  /**
   * Create a new shift
   * @param {Object} shiftData - Shift data
   * @returns {Promise<Object>} Created shift
   */
  async create(shiftData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find shift by ID
   * @param {string} id - Shift ID
   * @returns {Promise<Object|null>} Shift or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all shifts with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of shifts
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active shifts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active shifts
   */
  async findActive(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update shift
   * @param {string} id - Shift ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated shift
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete shift
   * @param {string} id - Shift ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count shifts
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get shift with assignments
   * @param {string} id - Shift ID
   * @returns {Promise<Object>} Shift with assignments
   */
  async findByIdWithAssignments(id) {
    throw new Error("Method not implemented");
  }
}

module.exports = IShiftRepository;
