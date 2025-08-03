const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../infrastructure/db/connection");

const ApprovalStep = sequelize.define(
  "ApprovalStep",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workflowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "approval_workflows",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    stepOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Order of this step in the workflow",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approverType: {
      type: DataTypes.ENUM(
        "specific_user",
        "department_head",
        "position_based",
        "role_based",
        "any_manager",
        "hr_manager",
        "finance_manager"
      ),
      allowNull: false,
      comment: "Type of approver for this step",
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Specific user ID if approverType is specific_user",
    },
    positionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "positions",
        key: "id",
      },
      comment: "Position ID if approverType is position_based",
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      comment: "Role ID if approverType is role_based",
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      comment: "Department ID for department_head or position_based",
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this step is required for approval",
    },
    canDelegate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether approver can delegate to someone else",
    },
    canSkip: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this step can be skipped",
    },
    autoApprove: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this step auto-approves after a certain time",
    },
    autoApproveAfterHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Hours after which to auto-approve",
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Step-specific settings and configurations",
    },
  },
  {
    tableName: "approval_steps",
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ["workflowId"],
      },
      {
        fields: ["stepOrder"],
      },
      {
        fields: ["approverType"],
      },
      {
        fields: ["approverId"],
      },
      {
        fields: ["positionId"],
      },
      {
        fields: ["roleId"],
      },
      {
        fields: ["departmentId"],
      },
    ],
  }
);

// Instance methods
ApprovalStep.prototype.isStepRequired = function () {
  return this.isRequired === true;
};

ApprovalStep.prototype.canStepDelegate = function () {
  return this.canDelegate === true;
};

ApprovalStep.prototype.canStepSkip = function () {
  return this.canSkip === true;
};

ApprovalStep.prototype.hasAutoApprove = function () {
  return this.autoApprove === true && this.autoApproveAfterHours > 0;
};

ApprovalStep.prototype.isSpecificUser = function () {
  return this.approverType === "specific_user";
};

ApprovalStep.prototype.isDepartmentHead = function () {
  return this.approverType === "department_head";
};

ApprovalStep.prototype.isPositionBased = function () {
  return this.approverType === "position_based";
};

ApprovalStep.prototype.isRoleBased = function () {
  return this.approverType === "role_based";
};

// Class methods
ApprovalStep.findByWorkflow = function (workflowId) {
  return this.findAll({
    where: { workflowId },
    order: [["stepOrder", "ASC"]],
  });
};

ApprovalStep.findRequired = function (workflowId) {
  return this.findAll({
    where: { workflowId, isRequired: true },
    order: [["stepOrder", "ASC"]],
  });
};

ApprovalStep.findByApproverType = function (approverType) {
  return this.findAll({ where: { approverType } });
};

module.exports = ApprovalStep;
