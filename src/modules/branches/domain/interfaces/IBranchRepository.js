/**
 * Branch Repository Interface
 * Defines the contract for branch data access operations
 */
class IBranchRepository {
  /**
   * Create a new branch
   * @param {Object} branchData - Branch data
   * @returns {Promise<Object>} Created branch
   */
  async create(branchData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find branch by ID
   * @param {string} id - Branch ID
   * @returns {Promise<Object|null>} Branch or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find branch by code
   * @param {string} code - Branch code
   * @returns {Promise<Object|null>} Branch or null
   */
  async findByCode(code) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all branches with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Object with branches and pagination
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active branches
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active branches
   */
  async findActive(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find headquarters branch
   * @returns {Promise<Object|null>} Headquarters branch or null
   */
  async findHeadquarters() {
    throw new Error("Method not implemented");
  }

  /**
   * Find branches by manager
   * @param {string} managerId - Manager employee ID
   * @returns {Promise<Array>} Array of branches
   */
  async findByManager(managerId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find sub-branches
   * @param {string} parentBranchId - Parent branch ID
   * @returns {Promise<Array>} Array of sub-branches
   */
  async findSubBranches(parentBranchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find branch hierarchy
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch with hierarchy information
   */
  async findHierarchy(branchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Update branch
   * @param {string} id - Branch ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated branch
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete branch
   * @param {string} id - Branch ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count branches
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get branch statistics
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch statistics
   */
  async getStatistics(branchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Get branch with employees
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Branch with employees
   */
  async findByIdWithEmployees(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get branch with manager
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Branch with manager details
   */
  async findByIdWithManager(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Check if branch code exists
   * @param {string} code - Branch code
   * @param {string} excludeId - Branch ID to exclude from check
   * @returns {Promise<boolean>} Whether code exists
   */
  async codeExists(code, excludeId = null) {
    throw new Error("Method not implemented");
  }

  /**
   * Update employee count
   * @param {string} branchId - Branch ID
   * @param {number} change - Change in employee count (+1 or -1)
   * @returns {Promise<boolean>} Success status
   */
  async updateEmployeeCount(branchId, change) {
    throw new Error("Method not implemented");
  }
}

module.exports = IBranchRepository;
