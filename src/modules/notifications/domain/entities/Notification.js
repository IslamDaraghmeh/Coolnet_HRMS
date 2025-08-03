const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("info", "success", "warning", "error", "reminder"),
      defaultValue: "info",
    },
    category: {
      type: DataTypes.ENUM(
        "leave",
        "attendance",
        "payroll",
        "loan",
        "performance",
        "general",
        "system"
      ),
      defaultValue: "general",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    channels: {
      type: DataTypes.JSONB,
      defaultValue: ["in-app"],
      comment: "Array of delivery channels: in-app, email, sms, push",
    },
    deliveryStatus: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Track delivery status for each channel",
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actionText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Additional data related to the notification",
    },
    sourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the source entity (leave, loan, etc.)",
    },
    sourceType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Type of the source entity",
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "For grouping related notifications",
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["isRead"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["scheduledAt"],
      },
      {
        fields: ["expiresAt"],
      },
      {
        fields: ["sourceId", "sourceType"],
      },
    ],
  }
);

// Instance methods
Notification.prototype.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

Notification.prototype.markAsUnread = async function () {
  this.isRead = false;
  this.readAt = null;
  await this.save();
};

Notification.prototype.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  await this.save();
};

Notification.prototype.unarchive = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  await this.save();
};

Notification.prototype.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

Notification.prototype.isScheduled = function () {
  return this.scheduledAt && new Date() < new Date(this.scheduledAt);
};

Notification.prototype.canSend = function () {
  return !this.isExpired() && !this.isScheduled();
};

Notification.prototype.updateDeliveryStatus = async function (
  channel,
  status,
  details = {}
) {
  if (!this.deliveryStatus) {
    this.deliveryStatus = {};
  }

  this.deliveryStatus[channel] = {
    status,
    details,
    updatedAt: new Date(),
  };

  if (status === "sent") {
    this.sentAt = new Date();
  }

  await this.save();
};

Notification.prototype.getDeliveryStatus = function (channel) {
  return this.deliveryStatus?.[channel] || null;
};

// Class methods
Notification.findByUser = function (userId, options = {}) {
  const where = { userId };

  if (options.unreadOnly) {
    where.isRead = false;
  }

  if (options.category) {
    where.category = options.category;
  }

  if (options.type) {
    where.type = options.type;
  }

  if (options.archived === false) {
    where.isArchived = false;
  }

  const order = options.order || [["createdAt", "DESC"]];
  const limit = options.limit || null;
  const offset = options.offset || 0;

  return this.findAll({ where, order, limit, offset });
};

Notification.findUnread = function (userId) {
  return this.findAll({
    where: { userId, isRead: false, isArchived: false },
    order: [["createdAt", "DESC"]],
  });
};

Notification.findByCategory = function (userId, category) {
  return this.findAll({
    where: { userId, category, isArchived: false },
    order: [["createdAt", "DESC"]],
  });
};

Notification.findScheduled = function () {
  return this.findAll({
    where: {
      scheduledAt: {
        [sequelize.Op.lte]: new Date(),
      },
      sentAt: null,
    },
  });
};

Notification.findExpired = function () {
  return this.findAll({
    where: {
      expiresAt: {
        [sequelize.Op.lt]: new Date(),
      },
      isRead: false,
    },
  });
};

Notification.findBySource = function (sourceId, sourceType) {
  return this.findAll({
    where: { sourceId, sourceType },
    order: [["createdAt", "DESC"]],
  });
};

Notification.markAllAsRead = async function (userId) {
  return this.update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } }
  );
};

Notification.deleteExpired = async function () {
  return this.destroy({
    where: {
      expiresAt: {
        [sequelize.Op.lt]: new Date(),
      },
      isRead: true,
    },
  });
};

module.exports = Notification;
