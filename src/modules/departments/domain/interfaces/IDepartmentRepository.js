/**
 * Department Repository Interface
 * Defines the contract for department data access operations
 */

class IDepartmentRepository {
  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} Created department
   */
  async create(departmentData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find department by ID
   * @param {string} id - Department ID
   * @returns {Promise<Object|null>} Department or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find department by code
   * @param {string} code - Department code
   * @returns {Promise<Object|null>} Department or null
   */
  async findByCode(code) {
    throw new Error("Method not implemented");
  }

  /**
   * Find department by name
   * @param {string} name - Department name
   * @returns {Promise<Object|null>} Department or null
   */
  async findByName(name) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all departments with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} List of departments
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update department
   * @param {string} id - Department ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated department
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete department
   * @param {string} id - Department ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find departments by head ID
   * @param {string} headId - Department head ID
   * @returns {Promise<Array>} List of departments
   */
  async findByHead(headId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find sub-departments of a parent department
   * @param {string} parentDepartmentId - Parent department ID
   * @returns {Promise<Array>} List of sub-departments
   */
  async findSubDepartments(parentDepartmentId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find main departments (no parent)
   * @returns {Promise<Array>} List of main departments
   */
  async findMainDepartments() {
    throw new Error("Method not implemented");
  }

  /**
   * Find active departments
   * @returns {Promise<Array>} List of active departments
   */
  async findActive() {
    throw new Error("Method not implemented");
  }

  /**
   * Count employees in a department
   * @param {string} departmentId - Department ID
   * @returns {Promise<number>} Employee count
   */
  async countEmployees(departmentId) {
    throw new Error("Method not implemented");
  }

  /**
   * Get department hierarchy
   * @param {string} departmentId - Department ID
   * @returns {Promise<Array>} Department hierarchy
   */
  async getHierarchy(departmentId) {
    throw new Error("Method not implemented");
  }
}

module.exports = IDepartmentRepository;
