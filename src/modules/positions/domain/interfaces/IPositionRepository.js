/**
 * Position Repository Interface
 * Defines the contract for position data access operations
 */

class IPositionRepository {
  /**
   * Create a new position
   * @param {Object} positionData - Position data
   * @returns {Promise<Object>} Created position
   */
  async create(positionData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find position by ID
   * @param {string} id - Position ID
   * @returns {Promise<Object|null>} Position or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find position by code
   * @param {string} code - Position code
   * @returns {Promise<Object|null>} Position or null
   */
  async findByCode(code) {
    throw new Error("Method not implemented");
  }

  /**
   * Find position by title
   * @param {string} title - Position title
   * @returns {Promise<Object|null>} Position or null
   */
  async findByTitle(title) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all positions with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} List of positions
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update position
   * @param {string} id - Position ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated position
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete position
   * @param {string} id - Position ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find positions by department
   * @param {string} departmentId - Department ID
   * @returns {Promise<Array>} List of positions
   */
  async findByDepartment(departmentId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find positions by category
   * @param {string} category - Position category
   * @returns {Promise<Array>} List of positions
   */
  async findByCategory(category) {
    throw new Error("Method not implemented");
  }

  /**
   * Find positions by level
   * @param {number} level - Position level
   * @returns {Promise<Array>} List of positions
   */
  async findByLevel(level) {
    throw new Error("Method not implemented");
  }

  /**
   * Find management positions
   * @returns {Promise<Array>} List of management positions
   */
  async findManagement() {
    throw new Error("Method not implemented");
  }

  /**
   * Find active positions
   * @returns {Promise<Array>} List of active positions
   */
  async findActive() {
    throw new Error("Method not implemented");
  }

  /**
   * Count employees in a position
   * @param {string} positionId - Position ID
   * @returns {Promise<number>} Employee count
   */
  async countEmployees(positionId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find positions with salary range
   * @param {number} minSalary - Minimum salary
   * @param {number} maxSalary - Maximum salary
   * @returns {Promise<Array>} List of positions
   */
  async findBySalaryRange(minSalary, maxSalary) {
    throw new Error("Method not implemented");
  }
}

module.exports = IPositionRepository;
