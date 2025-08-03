const express = require("express");
const router = express.Router();
const { authenticate, authorize, requirePermission } = require("../middlewares/auth");
const { validateRequest: validate } = require("../middlewares/validation");
const NotificationRepository = require("../../infrastructure/db/repositories/NotificationRepository");
const UserRepository = require("../../infrastructure/db/repositories/UserRepository");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create notification
 *     description: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  requirePermission(["notifications:create"]),
  async (req, res, next) => {
    try {
      const notificationRepository = new NotificationRepository();
      const userRepository = new UserRepository();

      // Validate recipient exists
      const recipient = await userRepository.findById(req.body.recipientId);
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: "Recipient not found",
        });
      }

      const notification = await notificationRepository.create({
        ...req.body,
        senderId: req.user.id,
        isRead: false,
        isSent: false,
      });

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     description: Retrieve notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: deliveryMethod
 *         schema:
 *           type: string
 *           enum: [in_app, email, sms, push]
 *         description: Filter by delivery method
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();
    const filters = { recipientId: req.user.id };
    const options = req.query;

    if (req.query.type) filters.type = req.query.type;
    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === "true";
    }
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.deliveryMethod)
      filters.deliveryMethod = req.query.deliveryMethod;

    const result = await notificationRepository.findAll(filters, options);

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     description: Retrieve a specific notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is the recipient
    if (
      notification.recipientId !== req.user.id &&
      !req.user.permissions.includes("notifications:read_all")
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification retrieved successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     description: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/:id/read", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is the recipient
    if (notification.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (notification.isRead) {
      return res.status(400).json({
        success: false,
        message: "Notification is already read",
      });
    }

    const updatedNotification = await notificationRepository.update(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications for the current user as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadAllNotificationsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/read-all", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();

    // Get all unread notifications for the user
    const unreadNotifications = await notificationRepository.findAll(
      {
        recipientId: req.user.id,
        isRead: false,
      },
      { limit: 1000 }
    );

    // Mark all as read
    const updatePromises = unreadNotifications.notifications.map(
      (notification) =>
        notificationRepository.update(notification.id, {
          isRead: true,
          readAt: new Date(),
        })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
      data: {
        updatedCount: unreadNotifications.notifications.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();
    const count = await notificationRepository.count({
      recipientId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully",
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/bulk:
 *   post:
 *     summary: Create bulk notifications
 *     description: Create multiple notifications for multiple recipients
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBulkNotificationRequest'
 *     responses:
 *       201:
 *         description: Bulk notifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkNotificationResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/bulk",
  authenticate,
  requirePermission(["notifications:create"]),
  async (req, res, next) => {
    try {
      const notificationRepository = new NotificationRepository();
      const userRepository = new UserRepository();

      const { recipients, notificationData } = req.body;

      if (
        !recipients ||
        !Array.isArray(recipients) ||
        recipients.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Recipients array is required",
        });
      }

      // Validate all recipients exist
      const recipientUsers = await Promise.all(
        recipients.map((id) => userRepository.findById(id))
      );

      const invalidRecipients = recipientUsers.filter((user) => !user);
      if (invalidRecipients.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some recipients not found",
        });
      }

      // Create notifications for all recipients
      const notificationPromises = recipients.map((recipientId) =>
        notificationRepository.create({
          ...notificationData,
          recipientId,
          senderId: req.user.id,
          isRead: false,
          isSent: false,
        })
      );

      const createdNotifications = await Promise.all(notificationPromises);

      res.status(201).json({
        success: true,
        message: "Bulk notifications created successfully",
        data: {
          createdCount: createdNotifications.length,
          notifications: createdNotifications,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const notificationRepository = new NotificationRepository();
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is the recipient or has admin permissions
    if (
      notification.recipientId !== req.user.id &&
      !req.user.permissions.includes("notifications:delete")
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await notificationRepository.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/settings:
 *   get:
 *     summary: Get notification settings
 *     description: Get notification settings for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationSettingsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/settings", authenticate, async (req, res, next) => {
  try {
    // This would typically fetch from a user settings table
    // For now, return default settings
    const settings = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationTypes: {
        leaves: true,
        attendance: true,
        payroll: true,
        performance: true,
        loans: true,
        general: true,
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
      },
    };

    res.status(200).json({
      success: true,
      message: "Notification settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/settings:
 *   put:
 *     summary: Update notification settings
 *     description: Update notification settings for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationSettingsRequest'
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationSettingsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/settings", authenticate, async (req, res, next) => {
  try {
    // This would typically update a user settings table
    // For now, just return the updated settings
    const updatedSettings = {
      ...req.body,
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
