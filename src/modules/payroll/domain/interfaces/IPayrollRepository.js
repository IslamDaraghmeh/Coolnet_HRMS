/**
 * Payroll Repository Interface
 * Defines the contract for payroll data access operations
 */
class IPayrollRepository {
  /**
   * Create a new payroll record
   * @param {Object} payrollData - Payroll data
   * @returns {Promise<Object>} Created payroll
   */
  async create(payrollData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find payroll by ID
   * @param {string} id - Payroll ID
   * @returns {Promise<Object|null>} Payroll or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all payroll records with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find payroll by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find payroll by period
   * @param {string} payPeriod - Pay period
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByPeriod(payPeriod, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find payroll by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByDateRange(startDate, endDate, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find pending payroll
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending payroll
   */
  async findPending(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find approved payroll
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of approved payroll
   */
  async findApproved(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update payroll
   * @param {string} id - Payroll ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated payroll
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete payroll
   * @param {string} id - Payroll ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count payroll records
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get payroll with employee details
   * @param {string} id - Payroll ID
   * @returns {Promise<Object>} Payroll with employee
   */
  async findByIdWithEmployee(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get payroll statistics
   * @param {string} payPeriod - Pay period
   * @returns {Promise<Object>} Payroll statistics
   */
  async getStatistics(payPeriod) {
    throw new Error("Method not implemented");
  }

  /**
   * Get employee payroll summary
   * @param {string} employeeId - Employee ID
   * @param {string} year - Year
   * @returns {Promise<Object>} Payroll summary
   */
  async getEmployeeSummary(employeeId, year) {
    throw new Error("Method not implemented");
  }

  /**
   * Generate payroll for period
   * @param {string} payPeriod - Pay period
   * @param {Array} employeeIds - Array of employee IDs
   * @returns {Promise<Array>} Generated payroll records
   */
  async generatePayroll(payPeriod, employeeIds) {
    throw new Error("Method not implemented");
  }
}

module.exports = IPayrollRepository;
