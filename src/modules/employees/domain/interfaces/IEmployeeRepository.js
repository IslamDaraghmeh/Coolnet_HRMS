/**
 * Employee Repository Interface
 * Defines the contract for employee data access operations
 */
class IEmployeeRepository {
  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  async create(employeeData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<Object|null>} Employee or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employee by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByEmployeeId(employeeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employee by email
   * @param {string} email - Employee email
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByEmail(email) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employee by phone number
   * @param {string} phoneNumber - Employee phone number
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByPhone(phoneNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all employees with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of employees
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active employees
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of active employees
   */
  async findActive(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by department
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of employees
   */
  async findByDepartment(department) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by position
   * @param {string} position - Position title
   * @returns {Promise<Array>} Array of employees
   */
  async findByPosition(position) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by employment type
   * @param {string} employmentType - Employment type
   * @returns {Promise<Array>} Array of employees
   */
  async findByEmploymentType(employmentType) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by manager
   * @param {string} managerId - Manager ID
   * @returns {Promise<Array>} Array of employees
   */
  async findByManager(managerId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Array of employees
   */
  async findByBranch(branchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find employees by work location
   * @param {string} workLocation - Work location type
   * @returns {Promise<Array>} Array of employees
   */
  async findByWorkLocation(workLocation) {
    throw new Error("Method not implemented");
  }

  /**
   * Assign employee to branch
   * @param {string} employeeId - Employee ID
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Updated employee
   */
  async assignToBranch(employeeId, branchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Remove employee from branch
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Updated employee
   */
  async removeFromBranch(employeeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Get branch statistics
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch employee statistics
   */
  async getBranchStatistics(branchId) {
    throw new Error("Method not implemented");
  }

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated employee
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete employee
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Soft delete employee (mark as inactive)
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Updated employee
   */
  async softDelete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count total employees
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Search employees by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching employees
   */
  async search(searchTerm, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get employee statistics
   * @returns {Promise<Object>} Employee statistics
   */
  async getStatistics() {
    throw new Error("Method not implemented");
  }

  /**
   * Bulk create employees
   * @param {Array} employeesData - Array of employee data
   * @returns {Promise<Array>} Array of created employees
   */
  async bulkCreate(employeesData) {
    throw new Error("Method not implemented");
  }

  /**
   * Bulk update employees
   * @param {Array} updates - Array of update objects with id and data
   * @returns {Promise<Array>} Array of updated employees
   */
  async bulkUpdate(updates) {
    throw new Error("Method not implemented");
  }
}

module.exports = IEmployeeRepository;
