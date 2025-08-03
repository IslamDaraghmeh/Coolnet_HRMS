const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../infrastructure/db/connection");

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
      comment: "Department head/manager",
    },
    parentDepartmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      comment: "Parent department for hierarchical structure",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
    },
    color: {
      type: DataTypes.STRING(7), // Hex color code
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Department-specific settings and configurations",
    },
  },
  {
    tableName: "departments",
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ["name"],
      },
      {
        fields: ["code"],
      },
      {
        fields: ["headId"],
      },
      {
        fields: ["parentDepartmentId"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Instance methods
Department.prototype.isActive = function () {
  return this.status === "active";
};

Department.prototype.hasHead = function () {
  return this.headId !== null;
};

Department.prototype.isSubDepartment = function () {
  return this.parentDepartmentId !== null;
};

Department.prototype.isMainDepartment = function () {
  return this.parentDepartmentId === null;
};

// Class methods
Department.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Department.findByHead = function (headId) {
  return this.findAll({ where: { headId } });
};

Department.findSubDepartments = function (parentDepartmentId) {
  return this.findAll({ where: { parentDepartmentId } });
};

Department.findMainDepartments = function () {
  return this.findAll({ where: { parentDepartmentId: null } });
};

module.exports = Department;
