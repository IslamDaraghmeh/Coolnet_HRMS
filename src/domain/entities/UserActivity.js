const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const UserActivity = sequelize.define(
  "UserActivity",
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
    activityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Type of activity (login, logout, create, update, delete, etc.)",
    },
    activityCategory: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Category of activity (auth, payroll, employee, etc.)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Additional details about the activity",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resourceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of resource affected (User, Employee, Payroll, etc.)",
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the resource affected",
    },
    status: {
      type: DataTypes.ENUM("success", "failure", "pending"),
      defaultValue: "success",
    },
  },
  {
    tableName: "UserActivities",
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
        fields: ["activityType"],
      },
      {
        fields: ["activityCategory"],
      },
      {
        fields: ["resourceType", "resourceId"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Instance methods
UserActivity.prototype.isSuccessful = function () {
  return this.status === "success";
};

UserActivity.prototype.isFailed = function () {
  return this.status === "failure";
};

UserActivity.prototype.isPending = function () {
  return this.status === "pending";
};

// Class methods
UserActivity.findByUserId = function (userId, options = {}) {
  const { limit = 50, offset = 0, activityType, activityCategory } = options;

  const where = { userId };
  if (activityType) where.activityType = activityType;
  if (activityCategory) where.activityCategory = activityCategory;

  return this.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

UserActivity.findBySessionId = function (sessionId, options = {}) {
  const { limit = 50, offset = 0 } = options;

  return this.findAll({
    where: { sessionId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

UserActivity.findByResource = function (
  resourceType,
  resourceId,
  options = {}
) {
  const { limit = 50, offset = 0 } = options;

  return this.findAll({
    where: { resourceType, resourceId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
};

UserActivity.findRecentByUserId = function (userId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.findAll({
    where: {
      userId,
      createdAt: {
        [Op.gte]: date,
      },
    },
    order: [["createdAt", "DESC"]],
  });
};

UserActivity.getActivityStats = async function (userId, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const stats = await this.findAll({
    where: {
      userId,
      createdAt: {
        [Op.gte]: date,
      },
    },
    attributes: [
      "activityType",
      "activityCategory",
      "status",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["activityType", "activityCategory", "status"],
    order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
  });

  return stats;
};

module.exports = UserActivity;
