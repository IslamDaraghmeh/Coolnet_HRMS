const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Session = sequelize.define(
  "Session",
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
    sessionToken: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    refreshToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Device information (browser, OS, IP, etc.)",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "IPv4 or IPv6 address",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Sessions",
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["sessionToken"],
      },
      {
        fields: ["refreshToken"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  }
);

// Instance methods
Session.prototype.isExpired = function () {
  return new Date() > this.expiresAt;
};

Session.prototype.isSessionActive = function () {
  return this.isActive && !this.isExpired();
};

Session.prototype.updateActivity = async function () {
  this.lastActivityAt = new Date();
  await this.save();
};

Session.prototype.deactivate = async function () {
  this.isActive = false;
  await this.save();
};

// Class methods
Session.findActiveByUserId = function (userId) {
  return this.findAll({
    where: {
      userId,
      isActive: true,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    order: [["lastActivityAt", "DESC"]],
  });
};

Session.findByToken = function (token) {
  return this.findOne({
    where: {
      sessionToken: token,
      isActive: true,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });
};

Session.findByRefreshToken = function (refreshToken) {
  return this.findOne({
    where: {
      refreshToken,
      isActive: true,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });
};

Session.cleanupExpired = async function () {
  return this.update(
    { isActive: false },
    {
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
        isActive: true,
      },
    }
  );
};

module.exports = Session;
