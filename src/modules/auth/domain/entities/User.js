const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");
const bcrypt = require("bcryptjs");
const config = require("../../config/index");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            config.security.bcryptRounds
          );
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(
            user.password,
            config.security.bcryptRounds
          );
        }
      },
    },
  }
);

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  await this.save();
};

// Class methods
User.findByPhone = function (phoneNumber) {
  return this.findOne({ where: { phoneNumber } });
};

User.findByEmail = function (email) {
  return this.findOne({ where: { email } });
};

User.findActive = function () {
  return this.findAll({ where: { isActive: true } });
};

module.exports = User;
