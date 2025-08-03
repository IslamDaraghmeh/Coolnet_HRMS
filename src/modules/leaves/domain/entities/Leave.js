const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Leave = sequelize.define(
  "Leave",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    leaveType: {
      type: DataTypes.ENUM(
        "annual",
        "sick",
        "personal",
        "maternity",
        "paternity",
        "bereavement",
        "unpaid"
      ),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    totalDays: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
      defaultValue: "pending",
    },
    currentApproverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    approvalLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    maxApprovalLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isHalfDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    halfDayType: {
      type: DataTypes.ENUM("morning", "afternoon"),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "leaves",
    timestamps: true,
    indexes: [
      {
        fields: ["employeeId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["leaveType"],
      },
      {
        fields: ["startDate", "endDate"],
      },
    ],
  }
);

// Instance methods
Leave.prototype.getDuration = function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

Leave.prototype.isPending = function () {
  return this.status === "pending";
};

Leave.prototype.isApproved = function () {
  return this.status === "approved";
};

Leave.prototype.isRejected = function () {
  return this.status === "rejected";
};

Leave.prototype.canApprove = function (userId) {
  return this.currentApproverId === userId && this.status === "pending";
};

Leave.prototype.requiresMoreApproval = function () {
  return this.approvalLevel < this.maxApprovalLevel;
};

Leave.prototype.isOverlapping = function (startDate, endDate) {
  return (
    this.startDate <= endDate &&
    this.endDate >= startDate &&
    this.status !== "cancelled" &&
    this.status !== "rejected"
  );
};

// Class methods
Leave.findByEmployee = function (employeeId, year = null) {
  const where = { employeeId };
  if (year) {
    where.startDate = {
      [sequelize.Op.gte]: `${year}-01-01`,
      [sequelize.Op.lte]: `${year}-12-31`,
    };
  }
  return this.findAll({ where, order: [["startDate", "DESC"]] });
};

Leave.findPending = function () {
  return this.findAll({ where: { status: "pending" } });
};

Leave.findByStatus = function (status) {
  return this.findAll({ where: { status } });
};

Leave.findOverlapping = function (
  employeeId,
  startDate,
  endDate,
  excludeId = null
) {
  const where = {
    employeeId,
    startDate: {
      [sequelize.Op.lte]: endDate,
    },
    endDate: {
      [sequelize.Op.gte]: startDate,
    },
    status: {
      [sequelize.Op.notIn]: ["cancelled", "rejected"],
    },
  };

  if (excludeId) {
    where.id = {
      [sequelize.Op.ne]: excludeId,
    };
  }

  return this.findAll({ where });
};

module.exports = Leave;
