/**
 * Notification Repository Interface
 * Defines the contract for notification data access operations
 */
class INotificationRepository {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(notificationData) {
    throw new Error("Method not implemented");
  }

  /**
   * Find notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object|null>} Notification or null
   */
  async findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Find all notifications with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findAll(filters = {}, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find notifications by recipient
   * @param {string} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findByRecipient(recipientId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find unread notifications by recipient
   * @param {string} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of unread notifications
   */
  async findUnreadByRecipient(recipientId, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Find notifications by type
   * @param {string} type - Notification type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findByType(type, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Update notification
   * @param {string} id - Notification ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated notification
   */
  async update(id, updateData) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Mark all notifications as read for recipient
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(recipientId) {
    throw new Error("Method not implemented");
  }

  /**
   * Count notifications
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Count unread notifications for recipient
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<number>} Unread count
   */
  async countUnread(recipientId) {
    throw new Error("Method not implemented");
  }

  /**
   * Get notification statistics
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<Object>} Notification statistics
   */
  async getStatistics(recipientId) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete old notifications
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOld(daysOld = 90) {
    throw new Error("Method not implemented");
  }
}

module.exports = INotificationRepository;
