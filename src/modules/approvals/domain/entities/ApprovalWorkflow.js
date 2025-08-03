const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../infrastructure/db/connection");

const ApprovalWorkflow = sequelize.define(
  "ApprovalWorkflow",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    entityType: {
      type: DataTypes.ENUM("leave", "loan", "expense", "purchase", "custom"),
      allowNull: false,
      comment: "Type of entity this workflow applies to",
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      comment: "Department this workflow applies to (null for all departments)",
    },
    positionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "positions",
        key: "id",
      },
      comment: "Position this workflow applies to (null for all positions)",
    },
    minAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Minimum amount that triggers this workflow",
    },
    maxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Maximum amount that triggers this workflow",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Workflow-specific settings and configurations",
    },
  },
  {
    tableName: "approval_workflows",
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ["name"],
      },
      {
        fields: ["entityType"],
      },
      {
        fields: ["departmentId"],
      },
      {
        fields: ["positionId"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

// Instance methods
ApprovalWorkflow.prototype.isWorkflowActive = function () {
  return this.isActive === true;
};

ApprovalWorkflow.prototype.appliesToAmount = function (amount) {
  if (!this.minAmount && !this.maxAmount) return true;
  if (this.minAmount && amount < this.minAmount) return false;
  if (this.maxAmount && amount > this.maxAmount) return false;
  return true;
};

ApprovalWorkflow.prototype.appliesToDepartment = function (departmentId) {
  return !this.departmentId || this.departmentId === departmentId;
};

ApprovalWorkflow.prototype.appliesToPosition = function (positionId) {
  return !this.positionId || this.positionId === positionId;
};

// Class methods
ApprovalWorkflow.findActive = function () {
  return this.findAll({ where: { isActive: true } });
};

ApprovalWorkflow.findByEntityType = function (entityType) {
  return this.findAll({ where: { entityType, isActive: true } });
};

ApprovalWorkflow.findByDepartment = function (departmentId) {
  return this.findAll({
    where: {
      [sequelize.Op.or]: [{ departmentId }, { departmentId: null }],
      isActive: true,
    },
  });
};

module.exports = ApprovalWorkflow;
