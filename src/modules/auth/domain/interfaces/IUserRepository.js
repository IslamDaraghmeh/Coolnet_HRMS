/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */
class IUserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find user by phone number
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object|null>} User or null
   */
  async findByPhone(phoneNumber) {
    throw new Error("Method not implemented");
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    throw new Error("Method not implemented");
  }

  /**
   * Find user by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmployeeId(employeeId) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find active users
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of active users
   */
  async findActive(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Update user refresh token
   * @param {string} id - User ID
   * @param {string} refreshToken - Refresh token
   * @param {Date} expiresAt - Expiration date
   * @returns {Promise<Object>} Updated user
   */
  async updateRefreshToken(id, refreshToken, expiresAt) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Soft delete user (mark as inactive)
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async softDelete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Count total users
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Get user with roles
   * @param {string} id - User ID
   * @returns {Promise<Object>} User with roles
   */
  async findByIdWithRoles(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Get user with permissions
   * @param {string} id - User ID
   * @returns {Promise<Object>} User with permissions
   */
  async findByIdWithPermissions(id) {
    throw new Error("Method not implemented");
  }
}

module.exports = IUserRepository;
