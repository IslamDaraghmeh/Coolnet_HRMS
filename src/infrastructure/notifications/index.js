const { v4: uuidv4 } = require("uuid");

/**
 * Notification Infrastructure
 * Handles system notifications
 */
class NotificationService {
  constructor() {
    this.notificationTypes = {
      LEAVE_REQUEST: "leave_request",
      LEAVE_APPROVED: "leave_approved",
      LEAVE_REJECTED: "leave_rejected",
      ATTENDANCE_ALERT: "attendance_alert",
      PAYROLL_GENERATED: "payroll_generated",
      PERFORMANCE_REVIEW: "performance_review",
      LOAN_REQUEST: "loan_request",
      LOAN_APPROVED: "loan_approved",
      LOAN_REJECTED: "loan_rejected",
      SYSTEM_ALERT: "system_alert",
    };
  }

  /**
   * Create notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const Notification = require("../../domain/entities/Notification");

      const notification = await Notification.create({
        id: uuidv4(),
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Send leave request notification
   * @param {Object} leaveData - Leave request data
   * @returns {Promise<Object>} Created notification
   */
  async sendLeaveRequestNotification(leaveData) {
    const { employeeId, leaveType, startDate, endDate, reason } = leaveData;

    return await this.createNotification({
      type: this.notificationTypes.LEAVE_REQUEST,
      title: "New Leave Request",
      message: `New ${leaveType} leave request from ${startDate} to ${endDate}`,
      recipientId: employeeId,
      data: {
        leaveType,
        startDate,
        endDate,
        reason,
      },
      priority: "medium",
    });
  }

  /**
   * Send leave approval notification
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Created notification
   */
  async sendLeaveApprovalNotification(approvalData) {
    const { employeeId, status, leaveType, startDate, endDate, comments } =
      approvalData;

    const title =
      status === "approved"
        ? "Leave Request Approved"
        : "Leave Request Rejected";
    const message =
      status === "approved"
        ? `Your ${leaveType} leave request from ${startDate} to ${endDate} has been approved`
        : `Your ${leaveType} leave request from ${startDate} to ${endDate} has been rejected`;

    return await this.createNotification({
      type:
        status === "approved"
          ? this.notificationTypes.LEAVE_APPROVED
          : this.notificationTypes.LEAVE_REJECTED,
      title,
      message,
      recipientId: employeeId,
      data: {
        status,
        leaveType,
        startDate,
        endDate,
        comments,
      },
      priority: "high",
    });
  }

  /**
   * Send attendance alert notification
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created notification
   */
  async sendAttendanceAlertNotification(attendanceData) {
    const { employeeId, date, type, message } = attendanceData;

    return await this.createNotification({
      type: this.notificationTypes.ATTENDANCE_ALERT,
      title: "Attendance Alert",
      message: `Attendance alert for ${date}: ${message}`,
      recipientId: employeeId,
      data: {
        date,
        type,
        message,
      },
      priority: "medium",
    });
  }

  /**
   * Send payroll notification
   * @param {Object} payrollData - Payroll data
   * @returns {Promise<Object>} Created notification
   */
  async sendPayrollNotification(payrollData) {
    const { employeeId, month, year, amount } = payrollData;

    return await this.createNotification({
      type: this.notificationTypes.PAYROLL_GENERATED,
      title: "Payroll Generated",
      message: `Your payroll for ${month} ${year} has been generated. Amount: $${amount}`,
      recipientId: employeeId,
      data: {
        month,
        year,
        amount,
      },
      priority: "high",
    });
  }

  /**
   * Send performance review notification
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created notification
   */
  async sendPerformanceReviewNotification(reviewData) {
    const { employeeId, reviewPeriod, reviewerId } = reviewData;

    return await this.createNotification({
      type: this.notificationTypes.PERFORMANCE_REVIEW,
      title: "Performance Review",
      message: `Performance review scheduled for ${reviewPeriod}`,
      recipientId: employeeId,
      data: {
        reviewPeriod,
        reviewerId,
      },
      priority: "medium",
    });
  }

  /**
   * Send loan request notification
   * @param {Object} loanData - Loan request data
   * @returns {Promise<Object>} Created notification
   */
  async sendLoanRequestNotification(loanData) {
    const { employeeId, amount, purpose } = loanData;

    return await this.createNotification({
      type: this.notificationTypes.LOAN_REQUEST,
      title: "New Loan Request",
      message: `New loan request for $${amount} - ${purpose}`,
      recipientId: employeeId,
      data: {
        amount,
        purpose,
      },
      priority: "medium",
    });
  }

  /**
   * Send loan approval notification
   * @param {Object} approvalData - Loan approval data
   * @returns {Promise<Object>} Created notification
   */
  async sendLoanApprovalNotification(approvalData) {
    const { employeeId, status, amount, comments } = approvalData;

    const title =
      status === "approved" ? "Loan Request Approved" : "Loan Request Rejected";
    const message =
      status === "approved"
        ? `Your loan request for $${amount} has been approved`
        : `Your loan request for $${amount} has been rejected`;

    return await this.createNotification({
      type:
        status === "approved"
          ? this.notificationTypes.LOAN_APPROVED
          : this.notificationTypes.LOAN_REJECTED,
      title,
      message,
      recipientId: employeeId,
      data: {
        status,
        amount,
        comments,
      },
      priority: "high",
    });
  }

  /**
   * Send system alert notification
   * @param {Object} alertData - Alert data
   * @returns {Promise<Object>} Created notification
   */
  async sendSystemAlertNotification(alertData) {
    const { recipientId, title, message, data } = alertData;

    return await this.createNotification({
      type: this.notificationTypes.SYSTEM_ALERT,
      title,
      message,
      recipientId,
      data,
      priority: "high",
    });
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const Notification = require("../../domain/entities/Notification");

      const notification = await Notification.findByPk(notificationId);
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
   * Mark all notifications as read for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(userId) {
    try {
      const Notification = require("../../domain/entities/Notification");

      const result = await Notification.update(
        {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
        {
          where: {
            recipientId: userId,
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
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteNotification(notificationId) {
    try {
      const Notification = require("../../domain/entities/Notification");

      const notification = await Notification.findByPk(notificationId);
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
   * Get unread notifications count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      const Notification = require("../../domain/entities/Notification");

      const count = await Notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
