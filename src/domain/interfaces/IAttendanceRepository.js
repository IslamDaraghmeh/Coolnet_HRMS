/**
 * Attendance Repository Interface
 * Defines the contract for attendance data access operations
 */
class IAttendanceRepository {
  /**
   * Create a new attendance record
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async create(attendanceData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find attendance by ID
   * @param {string} id - Attendance ID
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find attendance by employee and date
   * @param {string} employeeId - Employee ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findByEmployeeAndDate(employeeId, date) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all attendance records with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find attendance by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByEmployee(employeeId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find attendance by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByDateRange(startDate, endDate, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update attendance record
   * @param {string} id - Attendance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated attendance record
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete attendance record
   * @param {string} id - Attendance ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count attendance records
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get attendance statistics
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Attendance statistics
   */
  async getStatistics(employeeId, startDate, endDate) {
    throw new Error("Method not implemented");
  }

  /**
   * Get attendance with employee details
   * @param {string} id - Attendance ID
   * @returns {Promise<Object>} Attendance with employee
   */
  async findByIdWithEmployee(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get attendance summary for employee
   * @param {string} employeeId - Employee ID
   * @param {string} month - Month (YYYY-MM)
   * @returns {Promise<Object>} Attendance summary
   */
  async getMonthlySummary(employeeId, month) {
    throw new Error("Method not implemented");
  }
}

module.exports = IAttendanceRepository;
