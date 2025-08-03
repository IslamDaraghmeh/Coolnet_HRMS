/**
 * Loan Repository Interface
 * Defines the contract for loan data access operations
 */
class ILoanRepository {
  /**
   * Create a new loan
   * @param {Object} loanData - Loan data
   * @returns {Promise<Object>} Created loan
   */
  async create(loanData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find loan by ID
   * @param {string} id - Loan ID
   * @returns {Promise<Object|null>} Loan or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all loans with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find loans by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find pending loans
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending loans
   */
  async findPending(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active loans
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active loans
   */
  async findActive(options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find loans by type
   * @param {string} loanType - Loan type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findByType(loanType, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update loan
   * @param {string} id - Loan ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated loan
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete loan
   * @param {string} id - Loan ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count loans
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get loan with employee details
   * @param {string} id - Loan ID
   * @returns {Promise<Object>} Loan with employee
   */
  async findByIdWithEmployee(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get loan statistics
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Loan statistics
   */
  async getStatistics(employeeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Get loan balance
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Loan balance
   */
  async getLoanBalance(employeeId) {
    throw new Error("Method not implemented");
  }
}

module.exports = ILoanRepository;
