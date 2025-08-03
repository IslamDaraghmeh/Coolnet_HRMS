const { Op } = require("sequelize");
const Notification = require("../../../domain/entities/Notification");
const INotificationRepository = require("../../../domain/interfaces/INotificationRepository");

/**
 * Notification Repository Implementation
 * Sequelize-based implementation of notification data access
 */
class NotificationRepository extends INotificationRepository {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Find notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object|null>} Notification or null
   */
  async findById(id) {
    try {
      const notification = await Notification.findByPk(id);
      return notification;
    } catch (error) {
      throw new Error(`Failed to find notification by ID: ${error.message}`);
    }
  }

  /**
   * Find all notifications with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search,
        recipientId,
        type,
        isRead,
        priority,
      } = options;

      const where = {};

      // Apply filters
      if (recipientId) where.recipientId = recipientId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;
      if (priority) where.priority = priority;

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { message: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Notification.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        notifications: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find notifications: ${error.message}`);
    }
  }

  /**
   * Find notifications by recipient
   * @param {string} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findByRecipient(recipientId, options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "DESC" } = options;

      const notifications = await Notification.findAll({
        where: { recipientId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return notifications;
    } catch (error) {
      throw new Error(
        `Failed to find notifications by recipient: ${error.message}`
      );
    }
  }

  /**
   * Find unread notifications by recipient
   * @param {string} recipientId - Recipient ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of unread notifications
   */
  async findUnreadByRecipient(recipientId, options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "DESC" } = options;

      const notifications = await Notification.findAll({
        where: {
          recipientId,
          isRead: false,
        },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return notifications;
    } catch (error) {
      throw new Error(
        `Failed to find unread notifications by recipient: ${error.message}`
      );
    }
  }

  /**
   * Find notifications by type
   * @param {string} type - Notification type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async findByType(type, options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "DESC" } = options;

      const notifications = await Notification.findAll({
        where: { type },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return notifications;
    } catch (error) {
      throw new Error(`Failed to find notifications by type: ${error.message}`);
    }
  }

  /**
   * Update notification
   * @param {string} id - Notification ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated notification
   */
  async update(id, updateData) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update(updateData);
      return notification;
    } catch (error) {
      throw new Error(`Failed to update notification: ${error.message}`);
    }
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }

      await notification.update({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      });

      return notification;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read for recipient
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(recipientId) {
    try {
      const result = await Notification.update(
        {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
        {
          where: {
            recipientId,
            isRead: false,
          },
        }
      );

      return result[0];
    } catch (error) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }

  /**
   * Count notifications
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Notification.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count notifications: ${error.message}`);
    }
  }

  /**
   * Count unread notifications for recipient
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<number>} Unread count
   */
  async countUnread(recipientId) {
    try {
      const count = await Notification.count({
        where: {
          recipientId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      throw new Error(`Failed to count unread notifications: ${error.message}`);
    }
  }

  /**
   * Get notification statistics
   * @param {string} recipientId - Recipient ID
   * @returns {Promise<Object>} Notification statistics
   */
  async getStatistics(recipientId) {
    try {
      const total = await this.count({ recipientId });
      const unread = await this.countUnread(recipientId);
      const read = total - unread;

      const byType = await Notification.findAll({
        where: { recipientId },
        attributes: [
          "type",
          [
            Notification.sequelize.fn(
              "COUNT",
              Notification.sequelize.col("id")
            ),
            "count",
          ],
        ],
        group: ["type"],
      });

      const byPriority = await Notification.findAll({
        where: { recipientId },
        attributes: [
          "priority",
          [
            Notification.sequelize.fn(
              "COUNT",
              Notification.sequelize.col("id")
            ),
            "count",
          ],
        ],
        group: ["priority"],
      });

      return {
        total,
        read,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new Error(
        `Failed to get notification statistics: ${error.message}`
      );
    }
  }

  /**
   * Delete old notifications
   * @param {number} daysOld - Days old threshold
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOld(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate,
          },
          isRead: true,
        },
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to delete old notifications: ${error.message}`);
    }
  }
}

module.exports = NotificationRepository;
