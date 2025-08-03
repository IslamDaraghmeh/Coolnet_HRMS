const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const LeaveApproval = sequelize.define(
  "LeaveApproval",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    leaveId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "leaves",
        key: "id",
      },
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    approvalLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    decision: {
      type: DataTypes.ENUM("approve", "reject"),
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decisionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isCurrentApprover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "leave_approvals",
    timestamps: true,
    indexes: [
      {
        fields: ["leaveId"],
      },
      {
        fields: ["approverId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["isCurrentApprover"],
      },
    ],
  }
);

// Instance methods
LeaveApproval.prototype.isPending = function () {
  return this.status === "pending";
};

LeaveApproval.prototype.isApproved = function () {
  return this.status === "approved";
};

LeaveApproval.prototype.isRejected = function () {
  return this.status === "rejected";
};

LeaveApproval.prototype.canDecide = function () {
  return this.isCurrentApprover && this.status === "pending";
};

LeaveApproval.prototype.approve = async function (comments = null) {
  this.status = "approved";
  this.decision = "approve";
  this.comments = comments;
  this.decisionDate = new Date();
  this.isCurrentApprover = false;
  await this.save();
};

LeaveApproval.prototype.reject = async function (comments = null) {
  this.status = "rejected";
  this.decision = "reject";
  this.comments = comments;
  this.decisionDate = new Date();
  this.isCurrentApprover = false;
  await this.save();
};

// Class methods
LeaveApproval.findByLeave = function (leaveId) {
  return this.findAll({
    where: { leaveId },
    order: [["approvalLevel", "ASC"]],
  });
};

LeaveApproval.findCurrentApprover = function (leaveId) {
  return this.findOne({
    where: { leaveId, isCurrentApprover: true },
  });
};

LeaveApproval.findPendingByApprover = function (approverId) {
  return this.findAll({
    where: { approverId, status: "pending" },
  });
};

LeaveApproval.findByApprover = function (approverId) {
  return this.findAll({
    where: { approverId },
    order: [["createdAt", "DESC"]],
  });
};

module.exports = LeaveApproval;
