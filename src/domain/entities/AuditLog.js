const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Sessions",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Action performed (CREATE, READ, UPDATE, DELETE)",
    },
    tableName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Name of the table affected",
    },
    recordId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the record affected",
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Previous values before the change",
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "New values after the change",
    },
    changedFields: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Array of field names that were changed",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Unique request identifier for tracing",
    },
    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "API endpoint that triggered the action",
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "HTTP method (GET, POST, PUT, DELETE)",
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "HTTP status code of the response",
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Error message if the action failed",
    },
  },
  {
    tableName: "AuditLogs",
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["sessionId"],
      },
      {
        fields: ["action"],
      },
      {
        fields: ["tableName"],
      },
      {
        fields: ["recordId"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["requestId"],
      },
      {
        fields: ["statusCode"],
      },
    ],
  }
);

// Instance methods
AuditLog.prototype.isSuccessful = function () {
  return this.statusCode >= 200 && this.statusCode < 300;
};

AuditLog.prototype.isError = function () {
  return this.statusCode >= 400;
};

AuditLog.prototype.hasChanges = function () {
  return this.oldValues || this.newValues || this.changedFields;
};

// Class methods
AuditLog.findByUserId = function (userId, options = {}) {
  const { limit = 100, offset = 0, action, tableName } = options;

  const where = { userId };
  if (action) where.action = action;
  if (tableName) where.tableName = tableName;

  return this.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

AuditLog.findByTable = function (tableName, options = {}) {
  const { limit = 100, offset = 0, action, recordId } = options;

  const where = { tableName };
  if (action) where.action = action;
  if (recordId) where.recordId = recordId;

  return this.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

AuditLog.findByRecord = function (tableName, recordId, options = {}) {
  const { limit = 50, offset = 0 } = options;

  return this.findAll({
    where: { tableName, recordId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

AuditLog.findByRequestId = function (requestId) {
  return this.findAll({
    where: { requestId },
    order: [["createdAt", "ASC"]],
  });
};

AuditLog.findRecent = function (days = 7, options = {}) {
  const { limit = 100, offset = 0, userId, action, tableName } = options;

  const date = new Date();
  date.setDate(date.getDate() - days);

  const where = {
    createdAt: {
      [sequelize.Op.gte]: date,
    },
  };

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (tableName) where.tableName = tableName;

  return this.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

AuditLog.getAuditStats = async function (days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const stats = await this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.gte]: date,
      },
    },
    attributes: [
      "action",
      "tableName",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["action", "tableName"],
    order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
  });

  return stats;
};

module.exports = AuditLog;
