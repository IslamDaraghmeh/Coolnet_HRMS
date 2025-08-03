const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Hierarchy level for role-based access control",
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

// Instance methods
Role.prototype.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

Role.prototype.addPermission = function (permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
};

Role.prototype.removePermission = function (permission) {
  this.permissions = this.permissions.filter((p) => p !== permission);
};

// Class methods
Role.findByName = function (name) {
  return this.findOne({ where: { name } });
};

Role.findActive = function () {
  return this.findAll({ where: { isActive: true } });
};

module.exports = Role;
