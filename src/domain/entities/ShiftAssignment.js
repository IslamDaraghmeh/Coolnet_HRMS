const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const ShiftAssignment = sequelize.define(
  "ShiftAssignment",
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
    shiftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "shifts",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in-progress",
        "completed",
        "cancelled",
        "no-show"
      ),
      defaultValue: "scheduled",
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    actualStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "shift_assignments",
    timestamps: true,
    indexes: [
      {
        fields: ["employeeId", "date"],
      },
      {
        fields: ["shiftId", "date"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Instance methods
ShiftAssignment.prototype.getDuration = function () {
  if (this.actualStartTime && this.actualEndTime) {
    return (
      (new Date(this.actualEndTime) - new Date(this.actualStartTime)) /
      (1000 * 60 * 60)
    );
  }
  return (new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60 * 60);
};

ShiftAssignment.prototype.getBreakDuration = function () {
  if (this.breakStartTime && this.breakEndTime) {
    return (
      (new Date(this.breakEndTime) - new Date(this.breakStartTime)) /
      (1000 * 60 * 60)
    );
  }
  return 0;
};

ShiftAssignment.prototype.isToday = function () {
  const today = new Date().toISOString().split("T")[0];
  return this.date === today;
};

ShiftAssignment.prototype.isInProgress = function () {
  return this.status === "in-progress";
};

ShiftAssignment.prototype.canStart = function () {
  const now = new Date();
  const startTime = new Date(this.startTime);
  const endTime = new Date(this.endTime);

  return now >= startTime && now <= endTime && this.status === "scheduled";
};

// Class methods
ShiftAssignment.findByEmployee = function (employeeId, startDate, endDate) {
  const where = { employeeId };
  if (startDate && endDate) {
    where.date = {
      [sequelize.Op.between]: [startDate, endDate],
    };
  }
  return this.findAll({ where });
};

ShiftAssignment.findByDate = function (date) {
  return this.findAll({ where: { date } });
};

ShiftAssignment.findToday = function () {
  const today = new Date().toISOString().split("T")[0];
  return this.findAll({ where: { date: today } });
};

ShiftAssignment.findInProgress = function () {
  return this.findAll({ where: { status: "in-progress" } });
};

module.exports = ShiftAssignment;
